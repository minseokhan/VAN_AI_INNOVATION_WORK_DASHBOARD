# Step 2: project-admin

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/CLAUDE.md`
- `/docs/PRD.md` (4. 운영진 기능 — 프로젝트 생성/편집/삭제)
- `/docs/UI_GUIDE.md` (입력 필드, 버튼)
- `/src/lib/auth/guards.ts` (requireAdmin)
- `/src/app/(dashboard)/projects/[id]/page.tsx`, `actions.ts` (step 1 산출물)
- `/src/app/(dashboard)/projects/new/page.tsx` (자리표시 페이지 — 교체 대상)
- `/src/components/ui/Field.tsx`, `Input.tsx`, `Select.tsx`, `Textarea.tsx`

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

1. **검증 (TDD, `src/lib/projects/validation.ts`)**
   ```ts
   export type ProjectInput = { code: string; title: string; category: string; priority: string; summary: string; description: string; dueDate?: string }
   export function validateProject(input: ProjectInput): { ok: true; value: ProjectInput } | { ok: false; errors: Partial<Record<keyof ProjectInput, string>> }
   // code: /^\d+(-\d+)?$/ ; title 1~80 ; category 1~30 ; priority ∈ PRIORITY_ORDER ; summary 1~200 ; description 0~5000 ; dueDate 빈 문자열 또는 YYYY-MM-DD
   export function parseProjectForm(fd: FormData): ProjectInput   // trim 포함
   ```
2. **Server Actions** `src/app/(dashboard)/projects/actions.ts` — 첫 줄 `requireAdmin()`.
   ```ts
   export async function createProject(prev: FormState, fd: FormData): Promise<FormState>   // 성공 시 redirect(`/projects/${id}`)
   export async function updateProject(id: string, prev: FormState, fd: FormData): Promise<FormState>
   export async function deleteProject(id: string): Promise<void>                            // 성공 시 redirect("/")
   ```
   code 중복은 Prisma unique 에러(P2002)를 잡아 fieldErrors.code로 반환.
3. **폼 컴포넌트** `src/components/projects/ProjectForm.tsx` (client, `useActionState`): 생성/편집 공용. props `defaultValues?`, `action`. 필드: 과제 번호(code), 제목, 분야(datalist로 기존 분야 제안 + 자유 입력), 우선순위(Select, PRIORITY_ORDER), 한 줄 요약, 상세 설명(Textarea), 마감일(`<input type="date">`).
4. **페이지**
   - `src/app/(dashboard)/projects/new/page.tsx`: `requireAdmin` → ProjectForm(createProject). 기존 분야 목록은 서버에서 distinct 조회해 전달.
   - `src/app/(dashboard)/projects/[id]/edit/page.tsx`: `requireAdmin` → ProjectForm(updateProject.bind(null, id), defaultValues). 하단에 위험 구역: `DeleteProjectButton` (client) — 첫 클릭 시 "정말 삭제하시겠습니까? 기능·보고·질문이 모두 삭제됩니다" 문구와 "삭제 확인" 버튼으로 바뀌는 2단계 버튼. `window.confirm` 사용 금지.
   - step 1의 상세 페이지 헤더 "편집" 링크가 이 페이지로 연결되는지 확인.

## Acceptance Criteria

```bash
npm test
npm run lint && npm run build
ls src/lib/projects/validation.test.ts src/components/projects/ProjectForm.tsx "src/app/(dashboard)/projects/actions.ts" "src/app/(dashboard)/projects/[id]/edit/page.tsx"
```
DATABASE_URL이 있으면 수동 확인: 운영진으로 새 프로젝트 생성 → 목록에 카드 추가 → 편집 → 삭제 → 목록에서 사라짐. 부원 계정으로 `/projects/new` 접근 시 `/`로 이동.

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - 세 action 모두 첫 줄이 `requireAdmin()`인가?
   - 검증 규칙이 lib에 있고 테스트되는가?
   - 삭제가 Cascade로 하위 데이터를 정리하는가? (schema 확인)
3. 결과에 따라 `phases/3-projects/index.json`의 step 2를 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason"` 후 즉시 중단

## 금지사항

- 프로젝트 생성 폼에서 멤버 배치를 하지 마라. 이유: 4-members phase의 배치 보드에서 한다.
- 마크다운 에디터, 이미지 업로드를 추가하지 마라. 이유: 요청되지 않았다.
- `window.confirm`/`alert`를 쓰지 마라. 이유: 브라우저 모달은 자동화 테스트와 접근성에 나쁘다.
- 기존 테스트를 깨뜨리지 마라.
