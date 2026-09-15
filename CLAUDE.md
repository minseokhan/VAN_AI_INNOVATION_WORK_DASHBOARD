# 프로젝트: VAN AI 혁신부 업무 대시보드

VAN 학회 AI 혁신부 운영진·부원이 프로젝트 배치, 진행 상황, 주간 보고, 기획 질문을 한곳에서 관리하는 웹 대시보드.

## 기술 스택
- Next.js 15 (App Router) + React 19
- TypeScript strict mode
- Tailwind CSS v4 (테마 토큰은 `src/app/globals.css`의 `@theme`에 정의)
- Prisma + PostgreSQL (Vercel 배포, Neon/Supabase)
- 인증: 자체 ID/PW. bcryptjs 해시 + jose JWT httpOnly 쿠키
- 파일: @vercel/blob (기획안 업로드)
- 드래그 배치: @dnd-kit/core
- 테스트: vitest

## 아키텍처 규칙
- CRITICAL: 비즈니스 로직(권한 판단, 진행률 계산, 디스코드 메시지 조립, 입력 검증)은 `src/lib/`에 순수 함수로 두고 테스트를 먼저 작성한다. Server Action과 Route Handler는 lib 함수를 호출하는 얇은 껍데기여야 한다.
- CRITICAL: 모든 데이터 변경은 Server Action(`src/app/**/actions.ts`) 또는 Route Handler(`src/app/api/**`)에서만 수행한다. 클라이언트 컴포넌트가 Prisma·외부 API를 직접 호출하지 않는다.
- CRITICAL: 모든 Server Action은 첫 줄에서 `requireUser()` / `requireAdmin()`으로 세션과 권한을 확인한다. UI에서 버튼을 숨기는 것은 권한 검사가 아니다.
- CRITICAL: 비밀번호는 평문으로 저장·로그하지 않는다. JWT 시크릿·디스코드 웹훅·DB URL은 환경변수로만 읽는다.
- Prisma 클라이언트는 `src/lib/db.ts` 싱글턴만 사용한다.
- Server Component 기본. `"use client"`는 상호작용(폼, 드래그, 토글)이 필요한 말단 컴포넌트에만 붙인다.
- 컴포넌트는 `src/components/`, 타입은 Prisma 생성 타입을 우선 사용하고 추가 타입만 `src/types/`에 둔다.
- 디자인은 `docs/UI_GUIDE.md`를 따른다. 흰 바탕 + 남색 포인트. 보라색·글래스모피즘·그라데이션 텍스트 금지.

## 개발 프로세스
- CRITICAL: `src/lib/` 아래 새 모듈은 반드시 테스트(`*.test.ts`)를 먼저 작성하고, 통과하는 구현을 작성한다 (TDD). `.claude/hooks/tdd-guard.sh`가 이를 강제한다.
- 커밋 메시지는 conventional commits 형식 (feat:, fix:, docs:, refactor:, chore:).
- 사용자 개입이 필요한 항목(DB URL, Blob 토큰, 디스코드 웹훅 등)은 step을 `blocked` 처리하고 즉시 중단한다.

## 하네스 실행 규칙
- 각 step은 `phases/<phase>/step<N>.md`에 명시된 작업만 수행하고, 요청되지 않은 기능/파일을 만들지 않는다.
- AC를 직접 실행해 검증한 뒤 `phases/<phase>/index.json`의 step status를 갱신한다.
- step은 이 세션의 Claude가 직접 수행한다. `scripts/execute.py`는 `claude -p`로 자동 실행할 때만 쓴다.

## 명령어
npm run dev        # 개발 서버
npm run build      # 프로덕션 빌드
npm run lint       # ESLint
npm run test       # vitest
npx prisma migrate dev   # 마이그레이션
npx prisma db seed       # 시드 (운영진 계정 + 20개 프로젝트)

## 하네스
python3 scripts/execute.py <phase-dir> [--push]   # phase의 step을 순차 실행 (claude -p 호출)
python3 -m pytest scripts/test_execute.py         # 하네스 테스트
