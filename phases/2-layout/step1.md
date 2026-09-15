# Step 1: dashboard-shell

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/CLAUDE.md`
- `/docs/UI_GUIDE.md` (레이아웃 섹션)
- `/docs/ARCHITECTURE.md` (디렉토리 구조의 `(dashboard)` 라우트 그룹)
- `/docs/PRD.md` (페이지 목록과 권한)
- `/src/components/ui/*` (step 0 산출물)
- `/src/lib/auth/guards.ts`, `/src/app/(auth)/actions.ts` (logout)

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

로그인 후 모든 페이지가 공유하는 사이드바 레이아웃을 만들고, 이후 phase가 채울 라우트의 자리표시 페이지를 둔다.

1. **라우트 그룹 이동**: `src/app/page.tsx` → `src/app/(dashboard)/page.tsx`. 기존 스타일 확인용 섹션은 제거하고 `PageHeader("프로젝트")` + `EmptyState("프로젝트 목록은 다음 단계에서 표시됩니다")`만 남긴다.
2. **레이아웃** `src/app/(dashboard)/layout.tsx` (server): `requireUser()`로 사용자를 얻어 `<Sidebar user={...} pendingCount={...} />`와 본문(`max-w-6xl px-6 py-8`)을 배치. `pendingCount`는 ADMIN일 때만 `db.user.count({ where: { approved: false } })`.
3. **`src/components/layout/Sidebar.tsx`** (client — 활성 경로 표시에 `usePathname`):
   - `w-60 bg-navy-900 text-white`, 데스크톱 고정. 상단 워드마크 "VAN AI 혁신부".
   - 메뉴: 대시보드 `/` (LayoutGrid), 질문 `/questions` (MessageSquare). ADMIN에게만 "운영" 구분선 아래 배치 보드 `/assign` (Users), 멤버 관리 `/members` (UserCheck, pendingCount>0이면 amber 배지 숫자), 새 프로젝트 `/projects/new` (Plus).
   - 활성 항목 `bg-white/10`. 아이콘 16px strokeWidth 1.75.
   - 하단: Avatar + 이름 + 역할 라벨(운영진/부원) + 로그아웃 버튼(form action=logout).
4. **모바일** `src/components/layout/MobileHeader.tsx` (client): `lg:hidden` 상단 바 + 햄버거로 Sidebar를 오버레이 토글. 상태는 `useState`.
5. **자리표시 페이지** (각각 `requireUser` 또는 `requireAdmin` 호출 후 `PageHeader` + `EmptyState`):
   `src/app/(dashboard)/questions/page.tsx`, `assign/page.tsx`, `members/page.tsx`, `projects/new/page.tsx`. ADMIN 전용 페이지는 `requireAdmin()`이 throw하면 `not-found`가 아니라 `/`로 redirect한다 (`try/catch` 후 `redirect("/")`).
6. **fade-in**: 본문 컨테이너에 `animate-[fade-in_200ms_ease-out]`을 위해 `globals.css`에 `@keyframes fade-in` 정의. 이것 외 애니메이션 추가 금지.

## Acceptance Criteria

```bash
npm run lint && npm run build && npm test
ls "src/app/(dashboard)/layout.tsx" src/components/layout/Sidebar.tsx src/components/layout/MobileHeader.tsx
ls "src/app/(dashboard)/questions/page.tsx" "src/app/(dashboard)/assign/page.tsx" "src/app/(dashboard)/members/page.tsx" "src/app/(dashboard)/projects/new/page.tsx"
```
DATABASE_URL이 있으면 수동 확인: 운영진 로그인 → 사이드바에 운영 메뉴 3개 표시, 부원 계정은 미표시.

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - 권한 분기가 UI 숨김뿐 아니라 페이지의 `requireAdmin()`으로도 이루어지는가?
   - 클라이언트 컴포넌트(Sidebar)가 db를 import하지 않는가?
   - UI_GUIDE 레이아웃 치수(w-60, max-w-6xl)를 따르는가?
3. 결과에 따라 `phases/2-layout/index.json`의 step 1을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason"` 후 즉시 중단

## 금지사항

- 자리표시 페이지에 실제 기능을 구현하지 마라. 이유: 각 기능 phase의 범위다.
- 사이드바를 접는 애니메이션, 테마 토글, 알림 벨을 추가하지 마라. 이유: 요청되지 않았다.
- 기존 테스트를 깨뜨리지 마라.
