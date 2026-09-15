# Step 1: project-detail

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/CLAUDE.md`
- `/docs/PRD.md` (3. 프로젝트 상세)
- `/docs/UI_GUIDE.md` (체크리스트 항목, 섹션 레이아웃)
- `/docs/ARCHITECTURE.md` (데이터 흐름의 체크리스트 항목)
- `/src/lib/auth/guards.ts`, `/src/lib/auth/permissions.ts` (canEditProject)
- `/src/lib/projects/*` (step 0 산출물), `/src/components/ui/*`, `/src/components/projects/ProjectCard.tsx`

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

1. **순수 로직 (TDD, `src/lib/projects/features.ts`)**
   ```ts
   export function nextOrder(features: Array<{ order: number }>): number       // max+1, 빈 배열 → 0
   export function validateFeatureTitle(title: string): string | null          // trim 후 1~120자, 아니면 한국어 에러
   export function canTransitionStatus(from: ProjectStatus, to: ProjectStatus, memberCount: number): boolean
   // 허용: IN_PROGRESS→DONE, DONE→IN_PROGRESS. memberCount 0이면 어떤 전이도 불가. UNASSIGNED에서의 수동 전이는 불가(배치로만).
   ```
2. **Server Actions** `src/app/(dashboard)/projects/[id]/actions.ts` — 모두 첫 줄 `requireUser()`, 프로젝트 멤버 조회 후 `canEditProject` 검사, 실패 시 `throw new Error("FORBIDDEN")`. 성공 시 `revalidatePath("/projects/[id]")`와 `revalidatePath("/")`.
   ```ts
   export async function toggleFeature(projectId: string, featureId: string, done: boolean): Promise<void>
   export async function addFeature(projectId: string, title: string): Promise<{ error?: string }>
   export async function deleteFeature(projectId: string, featureId: string): Promise<void>
   export async function setProjectStatus(projectId: string, to: ProjectStatus): Promise<{ error?: string }>
   ```
3. **페이지** `src/app/(dashboard)/projects/[id]/page.tsx` (server): 없으면 `notFound()`. include: members(user), features(order asc), weeklyUpdates(최신순 5), planDocs, questions(최신순 5, author). `canEdit`를 계산해 하위 컴포넌트에 boolean으로 전달.
   레이아웃: 좌측 2/3 본문, 우측 1/3 사이드 패널(`bg-slate-50` 카드들). `lg:grid-cols-3`.
   - **헤더**: `code` 메타 + 제목, Badge(상태/우선순위/분야), ProgressBar(큰 버전, `calcProgress`), dueDate·startedAt 메타. 우측에 상태 전환 버튼(canEdit && canTransitionStatus일 때만, "완료로 표시"/"진행중으로 되돌리기"). ADMIN에게는 "편집" 링크(`/projects/[id]/edit`, step 2에서 구현).
   - **설명**: description을 문단 단위(`\n\n`)로 렌더. URL은 `<a>`로 자동 링크(간단한 정규식, lib/utils/linkify.ts, TDD).
   - **기능 체크리스트** `src/components/projects/FeatureChecklist.tsx` (client): `useOptimistic`으로 즉시 토글. 완료 항목 `line-through text-slate-400`. 하단 "기능 추가" 입력 + Enter. 각 항목 hover 시 삭제 아이콘(Trash2, aria-label). canEdit가 false면 읽기 전용.
   - **사이드 패널**:
     - 팀: 멤버 Avatar + 이름 + `POSITION_LABEL`. 0명이면 "아직 배치되지 않았습니다".
     - 초기 정보: githubUrl(링크), deployUrl(링크), mainLanguage, infraNote. 값이 없으면 "미입력" (편집 폼은 5-progress phase).
     - 기획안: planDocs 목록(kind 아이콘 FileText/Link2, 제목, 날짜). 0개면 "등록된 기획안이 없습니다".
   - **주간 보고**: 최신 5개 타임라인(주차 라벨, didThisWeek 요약). 0개면 EmptyState. (작성 폼은 5-progress phase)
   - **질문**: 최신 5개(작성자, 내용, 답변 여부 Badge) + "전체 보기" 링크 `/questions?project={id}`.

## Acceptance Criteria

```bash
npm test
npm run lint && npm run build
ls src/lib/projects/features.test.ts src/lib/utils/linkify.test.ts
ls "src/app/(dashboard)/projects/[id]/page.tsx" "src/app/(dashboard)/projects/[id]/actions.ts" src/components/projects/FeatureChecklist.tsx
```
DATABASE_URL이 있으면 수동 확인: 운영진으로 카드 클릭 → 상세 진입 → 기능 토글 시 진행률 변화 → 목록 카드에도 반영.

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - 모든 Server Action이 `requireUser()` + `canEditProject`를 거치는가?
   - 상태 전이 규칙이 lib 순수 함수에 있고 action은 그것을 호출만 하는가?
   - FeatureChecklist가 db를 import하지 않는가?
3. 결과에 따라 `phases/3-projects/index.json`의 step 1을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason"` 후 즉시 중단

## 금지사항

- 초기 정보·주간 보고·기획안·질문의 작성 폼을 만들지 마라. 이유: 5-progress, 6-questions phase의 범위다. 이 step은 읽기 전용 표시까지다.
- 프로젝트 편집 페이지를 만들지 마라. 이유: step 2의 범위다.
- 체크리스트 드래그 정렬을 추가하지 마라. 이유: 요청되지 않았다.
- 기존 테스트를 깨뜨리지 마라.
