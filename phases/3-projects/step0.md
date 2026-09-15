# Step 0: project-list

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/CLAUDE.md`
- `/docs/PRD.md` (2. 프로젝트 목록)
- `/docs/UI_GUIDE.md` (카드, 배지, 진행률 바, 레이아웃 그리드)
- `/docs/ADR.md` (ADR-005)
- `/prisma/schema.prisma`, `/src/lib/db.ts`
- `/src/components/ui/*`, `/src/lib/projects/labels.ts`, `/src/lib/utils/*` (이전 phase 산출물)
- `/src/app/(dashboard)/page.tsx`, `/src/app/(dashboard)/layout.tsx`

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

1. **순수 로직 (TDD, `src/lib/projects/`)**
   ```ts
   // progress.ts
   export function calcProgress(features: Array<{ done: boolean }>): number   // 0~100 정수, 반올림, 항목 0개 → 0
   // summary.ts
   export function summarize(projects: Array<{ status: ProjectStatus }>): { total: number; unassigned: number; inProgress: number; done: number }
   // filter.ts
   export type ProjectFilter = { status?: ProjectStatus | "ALL"; category?: string | "ALL"; q?: string }
   export function filterProjects<T extends { status: ProjectStatus; category: string; title: string; code: string; summary: string }>(projects: T[], f: ProjectFilter): T[]
   // q는 title/code/summary 대소문자 무시 부분일치
   export function sortProjects<T extends { status: ProjectStatus; priority: string; code: string }>(projects: T[]): T[]
   // 정렬: 진행중 → 미배정 → 완료, 같은 상태 안에서는 priorityRank 오름차순, 그다음 code 자연 정렬("2-1" < "2-10")
   ```
2. **데이터 조회** `src/lib/projects/queries.ts` (테스트 면제 대상이 아니므로 `vi.mock("@/lib/db")`로 호출 인자만 검증하는 테스트를 둔다):
   ```ts
   export function listProjectsForBoard(): Promise<ProjectCardData[]>
   // include: members(user: id,name), features(done만), weeklyUpdates(최신 1개의 createdAt), _count
   export type ProjectCardData = { id, code, title, summary, category, priority, status, dueDate, progress, members: {id,name,position}[], lastReportAt: Date | null }
   ```
3. **페이지** `src/app/(dashboard)/page.tsx` (server): `searchParams`(status, category, q)를 읽어 filter/sort 적용.
   - 상단 요약: `summarize` 결과를 4개의 작은 카드(전체/미배정/진행중/완료)로. 숫자 `text-2xl font-semibold tabular-nums`.
   - `src/components/projects/FilterBar.tsx` (client): 상태 세그먼트 버튼, 분야 Select(데이터에서 distinct), 검색 Input. 변경 시 `router.replace`로 URL 쿼리 갱신 (상태는 URL이 진실).
   - 카드 그리드 `grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`.
4. **`src/components/projects/ProjectCard.tsx`**: `Card href=/projects/{id}`. 구성(위→아래): [상태 Badge] [우선순위 Badge neutral] · 우측 `relativeDays(lastReportAt)` 또는 "보고 없음" / `code` 소문자 메타 + 제목 / 요약 `line-clamp-2` / ProgressBar / AvatarGroup(팀원) 또는 "미배정" 텍스트. dueDate가 있으면 `CalendarClock` 아이콘 + 날짜, 지났으면 red 텍스트.
5. 필터 결과 0개면 `EmptyState`.

## Acceptance Criteria

```bash
npm test
npm run lint && npm run build
ls src/lib/projects/progress.test.ts src/lib/projects/summary.test.ts src/lib/projects/filter.test.ts src/lib/projects/queries.test.ts
ls src/components/projects/ProjectCard.tsx src/components/projects/FilterBar.tsx
```
DATABASE_URL이 있으면 수동 확인: `/`에서 21개 카드, 요약 "전체 21 · 미배정 21", 분야 필터 동작.

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - 진행률·정렬·필터가 lib의 순수 함수에서만 계산되는가?
   - 카드가 UI_GUIDE의 프로젝트 카드 구성 순서를 따르는가?
   - FilterBar가 db를 import하지 않는가?
3. 결과에 따라 `phases/3-projects/index.json`의 step 0을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason"` 후 즉시 중단

## 금지사항

- 상세 페이지를 만들지 마라. 이유: step 1의 범위다.
- 클라이언트 상태 라이브러리나 SWR/React Query를 추가하지 마라. 이유: URL 쿼리 + Server Component로 충분하다.
- 진행률을 DB에 저장하지 마라. 이유: ADR-005.
- 기존 테스트를 깨뜨리지 마라.
