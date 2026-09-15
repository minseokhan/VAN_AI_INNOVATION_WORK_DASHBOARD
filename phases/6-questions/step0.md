# Step 0: questions-page

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/CLAUDE.md`
- `/docs/PRD.md` (5. 질문)
- `/docs/UI_GUIDE.md` (카드, 배지 amber=미답변, 입력 필드)
- `/prisma/schema.prisma` (Question)
- `/src/lib/auth/guards.ts`, `/src/lib/auth/permissions.ts`
- `/src/app/(dashboard)/questions/page.tsx` (자리표시 — 교체 대상)
- `/src/app/(dashboard)/projects/[id]/page.tsx` (질문 섹션 — 링크 확인)
- `/src/components/ui/*`, `/src/components/projects/FilterBar.tsx` (URL 쿼리 필터 패턴 참고)

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

1. **규칙·검증 (TDD, `src/lib/questions/rules.ts`)**
   ```ts
   export function validateQuestion(content: string): string | null            // trim 1~2000자
   export function validateAnswer(content: string): string | null              // trim 1~4000자
   export function canAskFor(user: { id: string; role: string }, memberUserIds: string[]): boolean   // 팀원 또는 ADMIN
   export function canDeleteQuestion(user: { id: string; role: string }, q: { authorId: string; answer: string | null }): boolean
   // 작성자 본인이고 미답변이거나, ADMIN
   export type QuestionFilter = { scope: "ALL" | "MINE" | "UNANSWERED"; project?: string }
   export function filterQuestions<T extends { projectId: string; answer: string | null; project: { memberIds: string[] } }>(qs: T[], f: QuestionFilter, userId: string): T[]
   // MINE = 내가 팀원인 프로젝트의 질문
   ```
2. **Server Actions** `src/app/(dashboard)/questions/actions.ts`
   ```ts
   export async function askQuestion(prev: FormState, fd: FormData): Promise<FormState>   // requireUser + canAskFor. fd: projectId, content
   export async function answerQuestion(questionId: string, prev: FormState, fd: FormData): Promise<FormState>   // requireAdmin. answer, answeredById, answeredAt 기록
   export async function deleteQuestion(questionId: string): Promise<{ error?: string }>   // requireUser + canDeleteQuestion
   ```
   성공 시 `revalidatePath("/questions")`와 해당 `/projects/${projectId}`.
3. **페이지** `src/app/(dashboard)/questions/page.tsx` (`requireUser`): `searchParams` (scope 기본 "ALL", project). 조회: questions(author, project(code,title,members), answeredBy) 최신순.
   - 상단 `QuestionForm` (client, `useActionState`): 프로젝트 Select — 부원은 내가 팀원인 프로젝트만, ADMIN은 전체. 내가 팀원인 프로젝트가 0개면 폼 대신 안내 "배치된 프로젝트가 없어 질문을 남길 수 없습니다". `?project=` 쿼리가 있으면 기본 선택. Textarea + "질문 남기기" 버튼.
   - 필터 세그먼트: 전체 / 내 프로젝트 / 미답변 (URL 쿼리). 미답변 개수 배지(amber).
   - 목록 `QuestionCard` (client): 상단 `code · 제목` 링크 + 작성자 + 날짜, 본문(줄바꿈 유지 `whitespace-pre-wrap`), 하단: 답변이 있으면 `bg-navy-50` 블록에 답변 + 답변자 + 날짜, 없으면 amber Badge "미답변". ADMIN에게 "답변하기" 텍스트 버튼 → 인라인 Textarea 폼(answerQuestion). 이미 답변된 질문은 "답변 수정"으로 같은 폼. `canDeleteQuestion`이면 삭제 ConfirmButton.
   - `sentToDiscordAt`가 있으면 카드 메타에 작은 회색 텍스트 "디스코드 전송됨 · 날짜".
4. 프로젝트 상세의 질문 섹션 "전체 보기" 링크가 `/questions?project={id}`로 연결되고, 섹션 상단에 "질문하기" 링크(`/questions?project={id}`)를 canEdit일 때 추가.

## Acceptance Criteria

```bash
npm test
npm run lint && npm run build
ls src/lib/questions/rules.test.ts "src/app/(dashboard)/questions/actions.ts" src/components/questions/QuestionForm.tsx src/components/questions/QuestionCard.tsx
```
DATABASE_URL이 있으면 수동 확인: 팀원으로 질문 등록 → 미답변 배지 → 운영진이 답변 → 답변 블록 표시. 다른 프로젝트 팀원은 삭제 버튼 미표시.

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - 세 action이 각각 올바른 guard와 lib 규칙을 거치는가?
   - 필터가 lib 순수 함수로 테스트되는가?
   - 클라이언트 컴포넌트가 db를 import하지 않는가?
3. 결과에 따라 `phases/6-questions/index.json`의 step 0을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason"` 후 즉시 중단

## 금지사항

- 디스코드 전송 로직을 만들지 마라. 이유: step 1의 범위다.
- 댓글 스레드, 좋아요, 멘션을 추가하지 마라. 이유: MVP 제외.
- 답변된 질문의 삭제를 작성자에게 허용하지 마라. 이유: 답변 이력이 사라진다.
- 기존 테스트를 깨뜨리지 마라.
