# Step 0: weekly-update

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/CLAUDE.md`
- `/docs/PRD.md` (3. 프로젝트 상세 — 초기 정보, 주간 보고 타임라인; 5. 대시보드 목적)
- `/docs/UI_GUIDE.md` (입력 필드, 섹션 레이아웃, 메타 텍스트)
- `/prisma/schema.prisma` (WeeklyUpdate의 `@@unique([projectId, weekStart])`)
- `/src/app/(dashboard)/projects/[id]/page.tsx`, `actions.ts` (3-projects 산출물)
- `/src/lib/auth/permissions.ts` (canEditProject), `/src/lib/utils/date.ts`

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

1. **주차 계산 (TDD, `src/lib/utils/week.ts`)** — KST 기준.
   ```ts
   export function getWeekStart(d: Date): Date          // 해당 주 월요일 00:00 (KST), 시간 성분 제거
   export function formatWeekLabel(weekStart: Date): string   // "9월 3주차 (9/15~9/21)" 형식. 주차 = 그 달에서 월요일 기준 몇 번째 주인지
   export function isCurrentWeek(weekStart: Date, now?: Date): boolean
   ```
2. **검증 (TDD, `src/lib/projects/info.ts`)**
   ```ts
   export const LANGUAGE_OPTIONS: string[]   // TypeScript, Python, JavaScript, Java, Kotlin, Swift, Go, 기타
   export type ProjectInfoInput = { githubUrl?: string; deployUrl?: string; mainLanguage?: string; infraNote?: string; startedAt?: string }
   export function validateProjectInfo(i: ProjectInfoInput): { ok: true; value: ProjectInfoInput } | { ok: false; errors: Partial<Record<keyof ProjectInfoInput, string>> }
   // URL은 http(s)만 허용, 빈 문자열은 null로 정규화. infraNote 0~500자. startedAt YYYY-MM-DD 또는 빈 값
   export type WeeklyInput = { didThisWeek: string; planNextWeek: string; issues?: string }
   export function validateWeekly(i: WeeklyInput): { ok: true; value: WeeklyInput } | { ok: false; errors: Partial<Record<keyof WeeklyInput, string>> }
   // didThisWeek, planNextWeek 1~2000자 필수, issues 0~2000자
   ```
3. **Server Actions** (`src/app/(dashboard)/projects/[id]/actions.ts`에 추가) — `requireUser()` + `canEditProject`.
   ```ts
   export async function updateProjectInfo(projectId: string, prev: FormState, fd: FormData): Promise<FormState>
   export async function submitWeeklyUpdate(projectId: string, prev: FormState, fd: FormData): Promise<FormState>
   // weekStart = getWeekStart(now). (projectId, weekStart) upsert — 같은 주에 다시 제출하면 덮어쓰고 authorId를 갱신
   ```
4. **UI (상세 페이지에 통합)**
   - 사이드 패널 "초기 정보"를 `src/components/projects/ProjectInfoPanel.tsx` (client)로 교체: canEdit면 우측 상단 "편집" 텍스트 버튼 → 인라인 폼(githubUrl, deployUrl, mainLanguage Select+기타 직접 입력, infraNote Textarea, startedAt date) ↔ 표시 모드 토글. 표시 모드는 기존과 동일(링크, 미입력).
   - 본문 "주간 보고" 섹션을 `src/components/projects/WeeklyUpdates.tsx`로: 상단에 canEdit면 `WeeklyUpdateForm` (client): 이번 주 라벨(`formatWeekLabel`) 표시, 이미 이번 주 보고가 있으면 그 값을 defaultValues로 채우고 버튼 문구 "이번 주 보고 수정". 필드: 이번 주 한 일 / 다음 주 계획 / 이슈·막힌 점(선택). 아래 타임라인은 전체 보고를 최신순으로: 주차 라벨 + 작성자 + `isCurrentWeek`면 navy Badge "이번 주", 세 필드를 소제목과 함께 표시.
   - 상세 페이지 조회에서 `weeklyUpdates`는 이제 전체(최신순)를 가져온다.
5. 목록 카드의 `lastReportAt`은 이미 최신 보고 시각을 쓰고 있으므로 변경 없음. 단, 2주 이상 보고가 없는 진행중 프로젝트는 카드 메타를 amber 텍스트 "N일째 보고 없음"으로 표시 (lib/utils/date.ts에 `daysSince` 추가, TDD).

## Acceptance Criteria

```bash
npm test
npm run lint && npm run build
ls src/lib/utils/week.test.ts src/lib/projects/info.test.ts src/components/projects/ProjectInfoPanel.tsx src/components/projects/WeeklyUpdateForm.tsx src/components/projects/WeeklyUpdates.tsx
```
DATABASE_URL이 있으면 수동 확인: 팀원으로 초기 정보 저장 → 표시 모드에 링크 반영. 주간 보고 제출 → 타임라인 최상단 "이번 주" 배지. 같은 주 재제출 시 항목이 늘지 않고 수정됨.

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - 주차 계산이 KST 기준이고 테스트에 경계(일요일 23:59, 월요일 00:00) 케이스가 있는가?
   - 두 action 모두 `canEditProject`를 거치는가?
   - 폼 컴포넌트가 db를 import하지 않는가?
3. 결과에 따라 `phases/5-progress/index.json`의 step 0을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason"` 후 즉시 중단

## 금지사항

- 주간 보고에 퍼센트 입력 필드를 넣지 마라. 이유: ADR-005, 진행률은 체크리스트에서 온다.
- 리치 텍스트 에디터를 추가하지 마라. 이유: Textarea로 충분하다.
- 보고 삭제 기능을 만들지 마라. 이유: 같은 주 재제출로 수정 가능하고 이력은 남겨야 한다.
- 기존 테스트를 깨뜨리지 마라.
