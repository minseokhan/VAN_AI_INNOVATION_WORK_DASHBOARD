# Step 0: members-admin

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/CLAUDE.md`
- `/docs/PRD.md` (1. 인증 — 승인, 4. 운영진 기능 — 멤버 관리)
- `/docs/ADR.md` (ADR-004)
- `/docs/UI_GUIDE.md` (배지, 버튼, 테이블 헤더 배경)
- `/src/lib/auth/guards.ts`, `/src/lib/auth/permissions.ts`
- `/src/app/(dashboard)/members/page.tsx` (자리표시 — 교체 대상), `/src/components/layout/Sidebar.tsx` (pendingCount)
- `/src/components/ui/*`

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

1. **규칙 (TDD, `src/lib/members/rules.ts`)**
   ```ts
   export function canChangeRole(actor: { id: string; role: string }, target: { id: string }, adminCount: number, to: "ADMIN" | "MEMBER"): { ok: true } | { ok: false; reason: string }
   // 본인 강등 불가, 마지막 ADMIN 강등 불가, actor가 ADMIN이 아니면 불가
   export function canRemoveUser(actor: { id: string }, target: { id: string; approved: boolean }): { ok: true } | { ok: false; reason: string }
   // 본인 삭제 불가. 승인된 사용자 삭제 불가(거절은 미승인만)
   ```
2. **Server Actions** `src/app/(dashboard)/members/actions.ts` — 첫 줄 `requireAdmin()`. 규칙 위반 시 `{ error }` 반환.
   ```ts
   export async function approveUser(userId: string): Promise<{ error?: string }>
   export async function rejectUser(userId: string): Promise<{ error?: string }>     // 미승인 사용자 삭제
   export async function setRole(userId: string, role: "ADMIN" | "MEMBER"): Promise<{ error?: string }>
   export async function setAdminType(userId: string, type: "PLANNING" | "DEV" | null): Promise<{ error?: string }>
   ```
   성공 시 `revalidatePath("/members")` 및 `revalidatePath("/", "layout")` (사이드바 pendingCount 갱신).
3. **페이지** `src/app/(dashboard)/members/page.tsx` (`requireAdmin`, 실패 시 `/`):
   - 섹션 1 "승인 대기" (있을 때만, amber 테두리 카드): 이름, 아이디, 가입일, [승인] [거절] 버튼. 거절은 2단계 확인 버튼(3-projects step 2의 DeleteProjectButton 패턴 재사용 — 공용 `ConfirmButton`으로 추출해 `src/components/ui/ConfirmButton.tsx`에 두고 기존 사용처도 교체).
   - 섹션 2 "멤버" 테이블: Avatar+이름 / 아이디 / 역할(Badge: 운영진 navy, 부원 neutral) / 운영진 구분(기획·개발, Select — ADMIN에게만 표시) / 참여 프로젝트 수 / 액션(운영진 지정·해제). 헤더 `bg-navy-50`. 본인 행에는 "(나)" 표시와 액션 비활성.
   - `src/components/members/MemberRow.tsx` (client): Select 변경·버튼 클릭 시 action 호출, 에러는 행 아래 red 텍스트.
4. Sidebar의 pendingCount 배지가 승인 후 0이 되면 사라지는지 확인.

## Acceptance Criteria

```bash
npm test
npm run lint && npm run build
ls src/lib/members/rules.test.ts "src/app/(dashboard)/members/actions.ts" src/components/members/MemberRow.tsx src/components/ui/ConfirmButton.tsx
```
DATABASE_URL이 있으면 수동 확인: 부원 가입 → 운영진 `/members`에서 승인 → 부원이 `/pending` 새로고침 시 `/`로 진입. 본인 강등 버튼 비활성.

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - 모든 action이 `requireAdmin()`으로 시작하고 lib 규칙을 통과하는가?
   - 마지막 운영진 강등이 서버에서 막히는가? (UI 비활성만으로는 부족)
   - MemberRow가 db를 import하지 않는가?
3. 결과에 따라 `phases/4-members/index.json`의 step 0을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason"` 후 즉시 중단

## 금지사항

- 승인된 사용자 삭제 기능을 만들지 마라. 이유: 프로젝트 이력이 사라진다. 필요하면 추후 "비활성화"로 별도 설계.
- 비밀번호 초기화, 이메일 발송을 추가하지 마라. 이유: MVP 제외.
- 배치 보드를 만들지 마라. 이유: step 1의 범위다.
- 기존 테스트를 깨뜨리지 마라.
