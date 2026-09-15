# 아키텍처

## 디렉토리 구조
```
prisma/
├── schema.prisma          # 데이터 모델
└── seed.ts                # 운영진 계정 + 20개 프로젝트 시드
src/
├── app/
│   ├── (auth)/login, register     # 인증 페이지 (레이아웃 없음)
│   ├── (dashboard)/               # 사이드바 레이아웃
│   │   ├── page.tsx               # 프로젝트 목록
│   │   ├── projects/[id]/         # 상세 + actions.ts
│   │   ├── projects/new/
│   │   ├── assign/                # 드래그 배치 보드 (운영진)
│   │   ├── members/               # 멤버 관리 (운영진)
│   │   └── questions/
│   ├── api/cron/digest/route.ts   # 디스코드 다이제스트 (Vercel Cron)
│   ├── api/upload/route.ts        # Blob 업로드
│   ├── globals.css                # Tailwind @theme 토큰
│   └── layout.tsx
├── components/
│   ├── ui/                        # Button, Badge, Card, Input, ProgressBar
│   ├── projects/                  # ProjectCard, FeatureChecklist, WeeklyUpdateForm ...
│   ├── assign/                    # MemberCard, ProjectDropColumn (dnd-kit)
│   └── layout/                    # Sidebar, Header
├── lib/
│   ├── db.ts                      # Prisma 싱글턴
│   ├── auth/                      # password.ts, session.ts, guards.ts(requireUser/requireAdmin)
│   ├── projects/                  # progress.ts, status.ts, validation.ts
│   ├── discord/                   # digest.ts (메시지 조립), webhook.ts (전송)
│   └── utils/                     # 날짜, 주차 계산
├── types/                         # Prisma 타입 외 추가 타입
└── middleware.ts                  # 미로그인 → /login, 미승인 → /pending
```

## 데이터 모델 (Prisma)
```
User          id, username(unique), passwordHash, name, role(ADMIN|MEMBER),
              adminType(PLANNING|DEV|null), approved(bool), createdAt
Project       id, title, summary, description, status(UNASSIGNED|IN_PROGRESS|DONE),
              githubUrl?, deployUrl?, mainLanguage?, infraNote?, startedAt?, createdAt, updatedAt
ProjectMember projectId, userId, position(FE|BE|AI|PM|ETC), assignedAt   @@id([projectId,userId])
Feature       id, projectId, title, done(bool), order, createdById, createdAt
WeeklyUpdate  id, projectId, authorId, weekStart(date), didThisWeek, planNextWeek, issues?, createdAt
PlanDoc       id, projectId, title, kind(FILE|LINK), url, uploadedById, createdAt
Question      id, projectId, authorId, content, answer?, answeredById?, answeredAt?,
              sentToDiscordAt?, createdAt
```
- 진행률은 저장하지 않고 `Feature.done` 비율로 계산한다 (`lib/projects/progress.ts`).
- `Project.status`는 명시 필드. 팀원이 0명이 되면 `UNASSIGNED`, 첫 배치 시 `IN_PROGRESS`로 자동 전이. `DONE`은 수동.

## 패턴
- Server Components가 Prisma로 직접 조회해 렌더. 변경은 같은 라우트의 `actions.ts`(Server Action) 사용, `revalidatePath`로 갱신.
- Route Handler는 외부 진입점(cron, 파일 업로드)에만 사용.
- 권한: `requireUser()`는 세션 없으면 redirect, `requireAdmin()`은 ADMIN 아니면 throw. `canEditProject(user, project)`는 팀원 또는 ADMIN.
- 순수 로직은 `lib/`에서 Prisma 의존 없이 작성해 vitest로 검증. DB 접근 함수는 얇게 유지.

## 데이터 흐름
```
로그인:      폼 → Server Action → lib/auth (bcrypt 검증, JWT 발급) → httpOnly 쿠키 → middleware가 매 요청 검증
체크리스트:  토글 클릭 → Server Action(requireUser, canEditProject) → Prisma 갱신 → revalidatePath → 진행률 재계산 렌더
배치:        드래그 드롭 → Server Action(requireAdmin) → ProjectMember upsert + status 전이 → revalidatePath
질문 다이제스트: Vercel Cron(09:00 UTC) → /api/cron/digest (CRON_SECRET 검증) → 미발송 질문 조회
              → lib/discord/digest.ts 메시지 조립 → 웹훅 POST → sentToDiscordAt 기록
기획안 파일: 클라이언트 → /api/upload (requireAdmin) → @vercel/blob put → URL → PlanDoc 생성
```

## 상태 관리
- 서버 상태: Server Components + Server Action + revalidatePath. 별도 fetch 라이브러리 없음.
- 클라이언트 상태: `useState`/`useOptimistic`(체크리스트 토글, 드래그 중 위치)만.

## 환경변수
```
DATABASE_URL, JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD,
BLOB_READ_WRITE_TOKEN, DISCORD_WEBHOOK_URL, DISCORD_PLANNER_ROLE_ID, CRON_SECRET
```
