# Step 1: assign-board

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/CLAUDE.md`
- `/docs/PRD.md` (4. 운영진 기능 — 배치 보드)
- `/docs/ADR.md` (ADR-008)
- `/docs/UI_GUIDE.md` (애니메이션 섹션 — 허용된 드롭 트랜지션, 아바타, 배지)
- `/docs/ARCHITECTURE.md` (데이터 흐름 — 배치)
- `/src/lib/projects/labels.ts`, `/src/lib/projects/features.ts` (canTransitionStatus)
- `/src/app/(dashboard)/assign/page.tsx` (자리표시 — 교체 대상)
- `/src/components/ui/*`, `/src/components/projects/ProjectCard.tsx`

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

1. **상태 전이 (TDD, `src/lib/projects/status.ts`)**
   ```ts
   export function deriveStatusAfterAssign(current: ProjectStatus, memberCountAfter: number): ProjectStatus
   // memberCountAfter === 0 → UNASSIGNED ; current UNASSIGNED && >0 → IN_PROGRESS ; DONE은 DONE 유지 ; 그 외 current 유지
   ```
2. **Server Actions** `src/app/(dashboard)/assign/actions.ts` — 첫 줄 `requireAdmin()`. 트랜잭션(`db.$transaction`)으로 ProjectMember 변경 + 멤버 수 재계산 + `deriveStatusAfterAssign`로 status 갱신.
   ```ts
   export async function assignMember(projectId: string, userId: string, position?: Position): Promise<{ error?: string }>   // upsert, 기본 ETC
   export async function unassignMember(projectId: string, userId: string): Promise<{ error?: string }>
   export async function setPosition(projectId: string, userId: string, position: Position): Promise<{ error?: string }>
   ```
   승인되지 않은 사용자(`approved=false`)는 배치 불가. 성공 시 `revalidatePath("/assign")`, `"/"`, `/projects/${projectId}`.
3. **페이지** `src/app/(dashboard)/assign/page.tsx` (`requireAdmin`): 승인된 사용자 전체(각자 참여 프로젝트 수 포함)와 프로젝트(members 포함, `searchParams.showDone` 없으면 DONE 제외, 정렬은 `sortProjects`)를 조회해 `AssignBoard`에 전달.
4. **`src/components/assign/AssignBoard.tsx`** (client, `@dnd-kit/core`):
   - 좌측 고정 패널(`w-64`, `sticky top-0`): 검색 Input + 멤버 카드 목록. 각 `MemberCard`는 `useDraggable`. 카드: Avatar + 이름 + "N개 참여" 메타. 이미 해당 프로젝트에 있는 멤버라도 드래그는 가능하되 드롭 시 서버가 upsert(중복 무해).
   - 우측: 프로젝트 컬럼 그리드(`grid gap-4 md:grid-cols-2 xl:grid-cols-3`). 각 `ProjectDropColumn`은 `useDroppable`. 헤더: code + 제목 + 상태 Badge. 본문: 배치된 멤버 칩(Avatar, 이름, 포지션 Select(`POSITION_LABEL`), 제거 X 버튼 aria-label). `isOver`일 때 `ring-2 ring-navy-500 bg-navy-50`.
   - `DragOverlay`에 드래그 중인 MemberCard 복제본 표시. 드롭 시 dnd-kit 기본 `dropAnimation`(200ms)만 사용. 그 외 애니메이션 금지.
   - 드롭 처리: `onDragEnd` → `over`가 있으면 즉시 낙관적으로 칩 추가(`useOptimistic` 또는 로컬 state) → `assignMember` 호출 → 에러 시 롤백하고 컬럼 하단에 red 텍스트.
   - 센서: `PointerSensor`(activationConstraint distance 6)와 `KeyboardSensor`. 키보드 접근성 유지.
   - 상단에 "완료 프로젝트 표시" 토글(URL 쿼리 `showDone=1`, Link).
5. 프로젝트 상세 페이지의 "팀" 섹션에 ADMIN 전용 "배치 보드에서 편집" 링크(`/assign`) 추가.

## Acceptance Criteria

```bash
npm test
npm run lint && npm run build
ls src/lib/projects/status.test.ts "src/app/(dashboard)/assign/actions.ts" src/components/assign/AssignBoard.tsx src/components/assign/MemberCard.tsx src/components/assign/ProjectDropColumn.tsx
```
DATABASE_URL이 있으면 수동 확인: 멤버를 미배정 프로젝트로 드래그 → 칩 추가 + 상태가 "진행중"으로 변경 → 목록 카드 반영. 마지막 멤버 제거 시 "미배정"으로 복귀.

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - 상태 전이가 lib 순수 함수에서 결정되고 action은 트랜잭션 안에서 적용하는가?
   - `@dnd-kit`가 배치 보드 외 다른 곳에서 import되지 않는가?
   - 허용된 애니메이션(dropAnimation, ring 하이라이트)만 있는가?
3. 결과에 따라 `phases/4-members/index.json`의 step 1을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason"` 후 즉시 중단

## 금지사항

- 프로젝트 컬럼 간 정렬(sortable)이나 멤버 간 순서 변경을 구현하지 마라. 이유: 요청되지 않았다.
- 미승인 사용자를 배치 목록에 보여주지 마라. 이유: 승인 전 계정은 팀원이 될 수 없다.
- `@dnd-kit/sortable`을 설치하지 마라. 이유: core만으로 충분하다.
- 기존 테스트를 깨뜨리지 마라.
