# Step 0: project-setup

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/CLAUDE.md`
- `/docs/ARCHITECTURE.md`
- `/docs/ADR.md`
- `/docs/UI_GUIDE.md` (색상 토큰 섹션)

## 작업

프로젝트 루트에 Next.js 15 앱을 초기화한다. 루트에는 이미 `CLAUDE.md`, `docs/`, `phases/`, `scripts/`, `.claude/`, `.gitignore`, `prisma/seed-projects.json`이 있으므로 이 파일들을 덮어쓰지 마라.

1. **Next.js 초기화**: 빈 임시 디렉토리에서 `npx create-next-app@latest <tmp> --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes`로 생성한 뒤, 생성물을 루트로 옮긴다. `.gitignore`는 기존 내용에 create-next-app의 항목을 병합한다 (`.env`, `.env*.local` 포함). `README.md`는 프로젝트 한 줄 설명으로 교체한다.
2. **의존성 설치**:
   - runtime: `@prisma/client@6 bcryptjs jose lucide-react @dnd-kit/core @dnd-kit/utilities @vercel/blob`
   - dev: `prisma@6 vitest @types/bcryptjs tsx`
   - Prisma는 6.x로 고정한다. 이유: 7.x는 `prisma.config.ts` 기반으로 설정 방식이 바뀌어 하네스 문서와 어긋난다.
3. **package.json 스크립트**: `"test": "vitest run --passWithNoTests"`, `"prisma": { "seed": "tsx prisma/seed.ts" }` 추가. `dev/build/lint/start`는 기본값 유지.
4. **vitest 설정** `vitest.config.ts`: `environment: "node"`, alias `@` → `./src`, `include: ["src/**/*.test.ts"]`.
5. **디자인 토큰** `src/app/globals.css`: Tailwind v4 `@import "tailwindcss";` 아래 `@theme`에 UI_GUIDE의 색상 토큰(`--color-navy-50/100/500/700/900`)과 `--font-sans: "Pretendard Variable", -apple-system, "Apple SD Gothic Neo", sans-serif`를 정의한다. `body`는 `bg-white text-slate-900`. create-next-app이 넣은 다크모드 `@media (prefers-color-scheme: dark)` 블록은 제거한다 (흰 바탕 고정).
6. **루트 레이아웃** `src/app/layout.tsx`: `lang="ko"`, `<head>`에 Pretendard CDN 링크 `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css`. metadata title "VAN AI 혁신부 대시보드". `src/app/page.tsx`는 "VAN AI 혁신부 대시보드" 제목만 있는 최소 페이지로 교체.
7. **환경변수 예시** `.env.example`:
   ```
   DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
   JWT_SECRET=change-me-32-chars-minimum
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=change-me
   BLOB_READ_WRITE_TOKEN=
   DISCORD_WEBHOOK_URL=
   DISCORD_PLANNER_ROLE_ID=
   CRON_SECRET=
   ```
8. **Vercel Cron** `vercel.json`: `{ "crons": [{ "path": "/api/cron/digest", "schedule": "0 9 * * *" }] }` (09:00 UTC = 18:00 KST).

## Acceptance Criteria

```bash
npm run lint && npm run build && npm test
test -f vitest.config.ts && test -f .env.example && test -f vercel.json
grep -q '"prisma": "6' package.json || grep -q '"prisma": "\^6' package.json
grep -q -- '--color-navy-700' src/app/globals.css
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - ARCHITECTURE.md 디렉토리 구조를 따르는가? (`src/app`, `src/components`, `src/lib`, `src/types` 디렉토리가 존재)
   - ADR 기술 스택을 벗어나지 않았는가? (shadcn, NextAuth, 상태관리 라이브러리 미설치)
   - CLAUDE.md CRITICAL 규칙을 위반하지 않았는가?
3. 결과에 따라 `phases/0-setup/index.json`의 step 0을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "산출물 한 줄 요약"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- 루트의 기존 파일(CLAUDE.md, docs/, phases/, scripts/, .claude/, prisma/seed-projects.json)을 삭제하거나 덮어쓰지 마라. 이유: 하네스와 시드 데이터가 사라진다.
- Prisma 스키마, 인증, 컴포넌트를 미리 만들지 마라. 이유: 다음 step의 범위다.
- 다크모드를 남기지 마라. 이유: 디자인은 흰 바탕 고정이다.
- 기존 테스트를 깨뜨리지 마라.
