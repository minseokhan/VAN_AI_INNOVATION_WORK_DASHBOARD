# Step 0: auth-lib

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/CLAUDE.md` (CRITICAL 규칙, TDD)
- `/docs/ARCHITECTURE.md` (패턴 섹션의 권한 규칙)
- `/docs/ADR.md` (ADR-003, ADR-004)
- `/prisma/schema.prisma`, `/src/lib/db.ts` (이전 phase 산출물)
- `/vitest.config.ts`

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

인증의 순수 로직 계층을 TDD로 작성한다. **각 모듈은 테스트 파일을 먼저 작성하고 실패를 확인한 뒤 구현한다.** UI와 Server Action은 다음 step이다.

1. `src/lib/auth/password.ts`
   ```ts
   export function hashPassword(plain: string): Promise<string>   // bcryptjs, cost 10
   export function verifyPassword(plain: string, hash: string): Promise<boolean>
   ```
2. `src/lib/auth/session.ts` — jose HS256, `JWT_SECRET` 환경변수, 만료 7일. 쿠키를 직접 다루지 않는 순수 함수.
   ```ts
   export const SESSION_COOKIE = "van_session"
   export type SessionUser = { id: string; username: string; name: string; role: "ADMIN" | "MEMBER"; approved: boolean }
   export function signSession(user: SessionUser): Promise<string>
   export function verifySession(token: string | undefined): Promise<SessionUser | null>  // 만료·위조·undefined → null
   ```
   `JWT_SECRET`이 없거나 16자 미만이면 throw.
3. `src/lib/auth/validation.ts`
   ```ts
   export type RegisterInput = { username: string; password: string; name: string }
   export function validateRegister(input: RegisterInput): { ok: true } | { ok: false; errors: Partial<Record<keyof RegisterInput, string>> }
   ```
   규칙: username 3~20자 `[a-z0-9_]`, password 8자 이상, name 1~20자(trim). 에러 메시지는 한국어.
4. `src/lib/auth/permissions.ts` — 순수 함수
   ```ts
   export function isAdmin(user: { role: string }): boolean
   export function canEditProject(user: { id: string; role: string }, memberUserIds: string[]): boolean  // 팀원 또는 ADMIN
   ```
5. `src/lib/auth/guards.ts` — `next/headers`의 `cookies()`와 `db`를 사용.
   ```ts
   export function getSessionUser(): Promise<SessionUser | null>   // 쿠키 → verifySession → db.user.findUnique로 최신 role/approved 반영. DB에 없으면 null
   export function requireUser(): Promise<SessionUser>             // 없으면 redirect("/login"), approved=false면 redirect("/pending")
   export function requireAdmin(): Promise<SessionUser>            // requireUser 후 ADMIN 아니면 throw new Error("FORBIDDEN")
   ```
   테스트는 `vi.mock("next/headers")`, `vi.mock("@/lib/db")`, `vi.mock("next/navigation")`으로 격리한다.

테스트 파일: `password.test.ts`, `session.test.ts`(process.env.JWT_SECRET 설정, 만료 토큰·위조 토큰 케이스 포함), `validation.test.ts`, `permissions.test.ts`, `guards.test.ts`.

## Acceptance Criteria

```bash
npm test
npm run lint && npm run build
ls src/lib/auth/password.test.ts src/lib/auth/session.test.ts src/lib/auth/validation.test.ts src/lib/auth/permissions.test.ts src/lib/auth/guards.test.ts
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - 로직이 `src/lib/auth/`에만 있고 `app/`에는 없는가?
   - 비밀번호 평문이 어디에도 로그·저장되지 않는가?
   - `JWT_SECRET`을 코드에 하드코딩하지 않았는가?
3. 결과에 따라 `phases/1-auth/index.json`의 step 0을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "산출물 한 줄 요약"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason"` 후 즉시 중단

## 금지사항

- 페이지, 폼, Server Action, middleware를 만들지 마라. 이유: step 1의 범위다.
- NextAuth/Auth.js 등 인증 라이브러리를 추가하지 마라. 이유: ADR-003.
- 세션 검증에서 DB 조회를 생략하지 마라. 이유: 승인 취소·권한 변경이 즉시 반영되어야 한다.
- 기존 테스트를 깨뜨리지 마라.
