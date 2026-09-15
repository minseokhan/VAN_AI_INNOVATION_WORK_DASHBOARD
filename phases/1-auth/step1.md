# Step 1: auth-pages

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/CLAUDE.md`
- `/docs/ARCHITECTURE.md` (디렉토리 구조, 데이터 흐름의 로그인 항목)
- `/docs/UI_GUIDE.md` (입력 필드, 버튼, 타이포그래피)
- `/docs/PRD.md` (1. 인증)
- `/src/lib/auth/*.ts` (step 0 산출물: password, session, validation, permissions, guards)
- `/src/lib/db.ts`, `/prisma/schema.prisma`

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

1. **라우트 그룹** `src/app/(auth)/layout.tsx`: 흰 배경, 화면 중앙에 `max-w-sm` 카드. 상단에 "VAN AI 혁신부" 워드마크(텍스트, navy-900).
2. **Server Actions** `src/app/(auth)/actions.ts` (`"use server"`):
   ```ts
   export async function login(prev: FormState, formData: FormData): Promise<FormState>
   export async function register(prev: FormState, formData: FormData): Promise<FormState>
   export async function logout(): Promise<void>
   // FormState = { error?: string; fieldErrors?: Record<string,string> }
   ```
   - login: username으로 조회 → `verifyPassword` → 실패 시 동일한 메시지 "아이디 또는 비밀번호가 올바르지 않습니다" (계정 존재 여부 노출 금지) → `signSession` → 쿠키 설정(`httpOnly`, `sameSite: "lax"`, `secure: NODE_ENV==="production"`, `path: "/"`, maxAge 7일) → approved면 `redirect("/")`, 아니면 `redirect("/pending")`.
   - register: `validateRegister` → username 중복 시 fieldErrors → `hashPassword` → `approved:false`로 생성 → 로그인과 동일하게 쿠키 설정 → `redirect("/pending")`.
   - logout: 쿠키 삭제 → `redirect("/login")`.
3. **페이지**
   - `src/app/(auth)/login/page.tsx` + `src/components/auth/LoginForm.tsx` (client, `useActionState`). 필드: 아이디, 비밀번호. 하단에 "계정이 없나요? 회원가입" 링크.
   - `src/app/(auth)/register/page.tsx` + `src/components/auth/RegisterForm.tsx`. 필드: 이름, 아이디, 비밀번호. 필드별 에러 표시.
   - `src/app/(auth)/pending/page.tsx` (server): `getSessionUser()`가 null이면 `/login`으로. approved가 true로 바뀌어 있으면 새 토큰을 발급해 쿠키를 갱신하고 `/`로 redirect. 아니면 "운영진 승인을 기다리는 중입니다" 안내 + 로그아웃 버튼(logout action).
   - 이미 로그인·승인된 사용자가 `/login`, `/register`에 오면 `/`로 redirect.
4. **middleware** `src/middleware.ts`: Edge에서 동작해야 하므로 DB를 쓰지 않고 `verifySession`만 사용.
   - 공개 경로: `/login`, `/register`, `/api/cron/*`(자체 시크릿 검증), `/_next/*`, 정적 파일.
   - 세션 없음 → `/login?next=<pathname>`. 세션 있고 `approved=false`이고 경로가 `/pending`이 아니면 → `/pending`.
   - `matcher`로 `_next/static`, `_next/image`, `favicon.ico` 제외.
5. `src/app/page.tsx`는 `requireUser()`를 호출하고 사용자 이름을 표시하는 임시 페이지로 교체 (대시보드는 다음 phase).

## Acceptance Criteria

```bash
npm run lint && npm run build && npm test
test -f src/middleware.ts && test -f src/app/\(auth\)/actions.ts
```
DATABASE_URL이 있으면 수동 확인: `npm run dev` → `/register`로 가입 → `/pending` 표시 → 시드 운영진 계정으로 `/login` → `/` 진입.

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - 모든 Server Action이 lib 함수를 호출하는 얇은 래퍼인가?
   - 클라이언트 컴포넌트가 db를 import하지 않는가?
   - 로그인 실패 메시지가 아이디 존재 여부를 노출하지 않는가?
   - UI_GUIDE의 입력/버튼 스타일과 navy 토큰을 썼는가? 보라색·그라데이션이 없는가?
3. 결과에 따라 `phases/1-auth/index.json`의 step 1을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason"` 후 즉시 중단

## 금지사항

- middleware에서 Prisma를 import하지 마라. 이유: Edge 런타임에서 동작하지 않는다.
- 비밀번호 찾기, 이메일 인증, 소셜 로그인을 만들지 마라. 이유: PRD MVP 제외.
- 사이드바·대시보드 레이아웃을 만들지 마라. 이유: 다음 phase의 범위다.
- 기존 테스트를 깨뜨리지 마라.
