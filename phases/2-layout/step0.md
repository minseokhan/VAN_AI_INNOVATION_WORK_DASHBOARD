# Step 0: ui-kit

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/CLAUDE.md`
- `/docs/UI_GUIDE.md` (전체 — 이 step의 기준 문서)
- `/docs/ARCHITECTURE.md` (디렉토리 구조)
- `/src/app/globals.css` (색상 토큰)
- `/prisma/schema.prisma` (enum 이름)

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

UI_GUIDE의 컴포넌트 스펙을 그대로 코드로 옮긴 공용 UI 키트와, 라벨 매핑 유틸을 만든다.

1. **유틸 (TDD, `src/lib/utils/`)**
   ```ts
   // cn.ts — falsy 값을 걸러 공백으로 join
   export function cn(...parts: Array<string | false | null | undefined>): string
   // initials.ts — "한민석" → "한", "Kim Minji" → "KM", 공백/빈 문자열 → "?"
   export function getInitials(name: string): string
   // date.ts — "2026-09-15" 형식, 상대 표기 "3일 전"/"오늘"
   export function formatDate(d: Date | string): string
   export function relativeDays(d: Date | string, now?: Date): string
   ```
2. **라벨 매핑 (TDD, `src/lib/projects/labels.ts`)** — Prisma enum을 한국어 라벨/배지 톤으로.
   ```ts
   export const STATUS_LABEL: Record<ProjectStatus, string>          // 미배정 / 진행중 / 완료
   export const STATUS_TONE: Record<ProjectStatus, BadgeTone>        // neutral / navy / green
   export const POSITION_LABEL: Record<Position, string>             // 프론트 / 백엔드 / AI / 기획 / 기타
   export const PRIORITY_ORDER: string[]                             // ["上","中上","中","中下","下","중장기"]
   export function priorityRank(p: string): number                   // 목록에 없으면 마지막
   ```
3. **컴포넌트 (`src/components/ui/`)** — 각 파일 하나의 컴포넌트, props는 native 속성 확장.
   - `Button.tsx`: `variant: "primary" | "secondary" | "danger" | "text"`, `size: "sm" | "md"`. UI_GUIDE의 클래스 그대로. 포커스 링 포함.
   - `Badge.tsx`: `tone: "neutral" | "navy" | "green" | "amber" | "red"`. 타입 `BadgeTone` export.
   - `Card.tsx`: 기본 카드 컨테이너. `as` prop 없이 div 고정. `href`가 있으면 `Link`로 감싸고 hover 테두리 navy-500.
   - `Input.tsx`, `Textarea.tsx`, `Select.tsx`: UI_GUIDE 입력 필드 스타일. `Field.tsx`: label + 자식 + error 텍스트 조합.
   - `ProgressBar.tsx`: `value: number(0~100)` + 우측 퍼센트 숫자 `tabular-nums`.
   - `Avatar.tsx`: 이름 → 이니셜 원형. `AvatarGroup.tsx`: 최대 4개 겹침 + "+N".
   - `EmptyState.tsx`: 아이콘(lucide, 16px) + 한 줄 메시지 + 선택적 액션 버튼.
   - `PageHeader.tsx`: 제목(text-2xl font-semibold) + 우측 액션 슬롯.
4. `src/app/page.tsx`에 임시로 위 컴포넌트를 한 번씩 렌더하는 스타일 확인용 섹션을 넣는다 (다음 step에서 교체됨).

## Acceptance Criteria

```bash
npm test
npm run lint && npm run build
ls src/lib/utils/cn.test.ts src/lib/utils/initials.test.ts src/lib/utils/date.test.ts src/lib/projects/labels.test.ts
ls src/components/ui/Button.tsx src/components/ui/Badge.tsx src/components/ui/ProgressBar.tsx src/components/ui/Avatar.tsx
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - UI_GUIDE의 안티패턴(blur, gradient-text, 보라색, rounded-2xl 일괄, 글로우)이 없는가?
   - 컴포넌트에 비즈니스 로직이 없는가? (라벨·날짜 계산은 lib에)
   - lucide 아이콘을 둥근 박스로 감싸지 않았는가?
3. 결과에 따라 `phases/2-layout/index.json`의 step 0을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason"` 후 즉시 중단

## 금지사항

- shadcn/ui, Radix, Headless UI 등 컴포넌트 라이브러리를 추가하지 마라. 이유: ADR-009.
- `clsx`/`tailwind-merge`를 설치하지 마라. 이유: `cn` 한 줄이면 충분하다.
- 사이드바·레이아웃을 만들지 마라. 이유: step 1의 범위다.
- 기존 테스트를 깨뜨리지 마라.
