# UI 디자인 가이드

## 디자인 원칙
1. **도구처럼 보여야 한다.** 랜딩 페이지가 아니라 매주 여는 운영 대시보드. 장식보다 정보 밀도.
2. **흰 바탕에 남색 하나.** 남색은 주요 액션, 활성 상태, 링크에만 쓴다. 나머지는 회색 톤.
3. **상태는 색보다 텍스트로.** 배지에는 항상 글자(미배정/진행중/완료)를 넣고 색은 보조.
4. **한 화면에서 답이 나와야 한다.** 목록에서 진행률·팀·최근 보고를 보고, 상세로 들어가는 것은 편집할 때.

## AI 슬롭 안티패턴 — 하지 마라
| 금지 사항 | 이유 |
|-----------|------|
| backdrop-filter: blur() | glass morphism은 AI 템플릿의 가장 흔한 징후 |
| gradient-text | AI가 만든 SaaS 랜딩의 1번 특징 |
| 배경 gradient orb (blur-3xl 원형) | 모든 AI 랜딩 페이지에 있는 장식 |
| box-shadow 글로우 | 네온 글로우 = AI 슬롭 |
| 보라/인디고 색상 | 브랜드는 남색. 보라 계열 전면 금지 |
| 모든 카드에 동일한 rounded-2xl | 균일한 큰 라운드는 템플릿 느낌. 기본 `rounded-md` |
| 아이콘을 둥근 색 박스로 감싸기 | 장식. 아이콘은 인라인 |
| 히어로 섹션, 마케팅 문구 | 내부 도구에 소개 문구는 필요 없다 |

## 색상 (Tailwind v4 `@theme` 토큰)
### 브랜드 / 배경
| 토큰 | 값 | 용도 |
|------|------|------|
| `--color-navy-900` | `#0B1F3F` | 사이드바 배경, 페이지 제목 강조 |
| `--color-navy-700` | `#14305C` | Primary 버튼, 활성 메뉴, 진행률 바 |
| `--color-navy-500` | `#2B5087` | 링크, hover, 포커스 링 |
| `--color-navy-100` | `#E6ECF5` | 선택/활성 배경, 진행중 배지 배경 |
| `--color-navy-50`  | `#F2F5FA` | 섹션 구분 배경, 테이블 헤더 |
| 페이지 배경 | `#FFFFFF` | |
| 서브 배경 | `#F8FAFC` (slate-50) | 사이드 패널, 코드/메타 영역 |
| 테두리 | `#E2E8F0` (slate-200) | 카드, 입력, 구분선 |

### 텍스트
| 용도 | 값 |
|------|------|
| 주 텍스트 | `#0F172A` (slate-900) |
| 본문 | `#334155` (slate-700) |
| 보조 | `#64748B` (slate-500) |
| 비활성 | `#94A3B8` (slate-400) |

### 시맨틱
| 용도 | 값 | 배지 배경 |
|------|------|------|
| 완료 / 성공 | `#15803D` (green-700) | `#DCFCE7` |
| 주의 / 미답변 | `#B45309` (amber-700) | `#FEF3C7` |
| 에러 / 삭제 | `#B91C1C` (red-700) | `#FEE2E2` |
| 진행중 | `navy-700` | `navy-100` |
| 미배정 | `#475569` (slate-600) | `#F1F5F9` |

## 컴포넌트
### 카드
```
rounded-md bg-white border border-slate-200 p-5 hover:border-navy-500 transition-colors
```
프로젝트 카드 구성(위→아래): 상태 배지 + 최근 보고일 / 제목(text-base font-semibold) / 요약 1~2줄(text-sm text-slate-500, line-clamp-2) / 진행률 바 + 퍼센트 / 팀원 이니셜 아바타(겹침, 최대 4개 + "+N").

### 버튼
```
Primary:   rounded-md bg-navy-700 text-white px-4 py-2 text-sm font-medium hover:bg-navy-900
Secondary: rounded-md border border-slate-300 bg-white text-slate-700 px-4 py-2 text-sm hover:bg-slate-50
Danger:    rounded-md text-red-700 hover:bg-red-50 px-3 py-2 text-sm
Text:      text-navy-500 hover:underline text-sm
```
포커스: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500`

### 입력 필드
```
rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400
focus:border-navy-500 focus:ring-2 focus:ring-navy-100
```
라벨은 `text-xs font-medium text-slate-600 mb-1`. 에러는 입력 아래 `text-xs text-red-700`.

### 배지
```
inline-flex items-center rounded px-2 py-0.5 text-xs font-medium  (색은 시맨틱 표)
```

### 진행률 바
```
h-2 w-full rounded-full bg-slate-100  >  h-2 rounded-full bg-navy-700 (width: %)
```
퍼센트 숫자는 바 오른쪽 `text-xs tabular-nums text-slate-600`.

### 체크리스트 항목
```
flex items-center gap-3 py-2 border-b border-slate-100
checkbox: h-4 w-4 rounded border-slate-300 accent-navy-700
done:     line-through text-slate-400
```

### 아바타
이니셜 1~2글자, `h-7 w-7 rounded-full bg-navy-100 text-navy-700 text-xs font-semibold`.

## 레이아웃
- 좌측 사이드바 고정 `w-60 bg-navy-900 text-white`, 메뉴 활성 항목 `bg-white/10`. 모바일에서는 상단 바 + 햄버거.
- 본문 `mx-auto max-w-6xl px-6 py-8`, 사이드바 옆 남은 폭에서 가운데 정렬.
- 카드 그리드 `grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`.
- 섹션 간 `space-y-8`, 섹션 제목 `text-sm font-semibold text-slate-900` + 우측 액션 버튼.

## 타이포그래피
폰트: `Pretendard Variable`, fallback `-apple-system, "Apple SD Gothic Neo", sans-serif`.
| 용도 | 스타일 |
|------|--------|
| 페이지 제목 | `text-2xl font-semibold text-slate-900` |
| 섹션 제목 | `text-sm font-semibold text-slate-900` |
| 카드 제목 | `text-base font-semibold text-slate-900` |
| 본문 | `text-sm text-slate-700 leading-relaxed` |
| 메타 | `text-xs text-slate-500` |
| 숫자 | `tabular-nums` |

## 애니메이션
- 허용: `transition-colors` (150ms) hover/focus, 페이지 콘텐츠 `fade-in` (200ms), dnd-kit 드롭 시 기본 `transform` 트랜지션 (200ms)과 드롭 대상 컬럼 `ring-2 ring-navy-500` 하이라이트.
- 그 외 모든 애니메이션(바운스, 펄스, 글로우, 스켈레톤 shimmer) 금지.

## 아이콘
- `lucide-react`, `size={16}` `strokeWidth={1.75}`. 텍스트와 나란히 인라인 배치.
- 아이콘 컨테이너(둥근 배경 박스)로 감싸지 않는다.

## 접근성
- 모든 폼 입력에 `<label htmlFor>`. 아이콘 단독 버튼에는 `aria-label`.
- 상태 배지는 색만으로 구분하지 않는다(텍스트 필수).
- 키보드 포커스 링을 지우지 않는다.
