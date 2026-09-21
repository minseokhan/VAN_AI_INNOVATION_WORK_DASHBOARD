# Step 1: db-schema

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/CLAUDE.md`
- `/docs/ARCHITECTURE.md` (데이터 모델 섹션)
- `/docs/ADR.md` (ADR-002, ADR-004, ADR-005)
- `/prisma/seed-projects.json` (21개 과제 시드 데이터)
- `/package.json`, `/.env.example` (step 0 산출물)

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

1. **`prisma/schema.prisma`**: `provider = "postgresql"`, `url = env("DATABASE_URL")`. ARCHITECTURE.md의 모델을 그대로 정의한다.
   - enum `Role { ADMIN MEMBER }`, `AdminType { PLANNING DEV }`, `ProjectStatus { UNASSIGNED IN_PROGRESS DONE }`, `Position { FE BE AI PM ETC }`, `PlanDocKind { FILE LINK }`
   - `User`: `username @unique`, `approved Boolean @default(false)`, `role Role @default(MEMBER)`, `adminType AdminType?`
   - `Project`: `code String @unique`, `category String`, `priority String`, `dueDate DateTime?`, `status ProjectStatus @default(UNASSIGNED)`, 선택 필드 `githubUrl deployUrl mainLanguage infraNote startedAt`, `createdAt @default(now())`, `updatedAt @updatedAt`
   - `ProjectMember`: `@@id([projectId, userId])`, `position Position @default(ETC)`, `assignedAt @default(now())`
   - `Feature`: `done Boolean @default(false)`, `order Int`, `createdById String?`
   - `WeeklyUpdate`: `weekStart DateTime @db.Date`, `didThisWeek String`, `planNextWeek String`, `issues String?`, `@@unique([projectId, weekStart])`
   - `PlanDoc`: `kind PlanDocKind`, `url String`, `title String`
   - `Question`: `answer String?`, `answeredById String?`, `answeredAt DateTime?`, `sentToDiscordAt DateTime?`
   - 모든 id는 `String @id @default(cuid())`. 관계는 `onDelete: Cascade` (Project 삭제 시 하위 전부 삭제). User 삭제 시 `Feature.createdById`, `Question.answeredById`는 `SetNull`.
2. **`src/lib/db.ts`**: PrismaClient 싱글턴 (`globalThis` 캐시, dev 핫리로드 대비). 이 파일 외에서 `new PrismaClient()`를 만들지 않는다.
3. **`prisma/seed.ts`**: 멱등 시드.
   - `ADMIN_USERNAME`/`ADMIN_PASSWORD` 환경변수로 운영진 계정 upsert (`bcryptjs.hash`, cost 10, `role: ADMIN`, `adminType: DEV`, `approved: true`, `name: "운영진"`). 환경변수가 없으면 명확한 에러로 종료.
   - `prisma/seed-projects.json`을 읽어 `code` 기준으로 Project upsert. `features` 배열은 해당 프로젝트에 Feature가 0개일 때만 생성한다 (재실행 시 팀이 편집한 체크리스트를 덮어쓰지 않는다). `order`는 배열 인덱스. `dueDate` 문자열은 Date로 변환.
4. **마이그레이션**: `DATABASE_URL`이 설정되어 있으면 `npx prisma migrate dev --name init`. 없으면 `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/0001_init/migration.sql`로 SQL을 생성하고 `prisma/migrations/migration_lock.toml`(`provider = "postgresql"`)을 만든다. 실제 DB 적용은 URL이 생기면 `npx prisma migrate deploy`로 한다.
5. `.gitignore`에 `prisma/*.db`는 불필요(Postgres). 변경 없음.

## Acceptance Criteria

```bash
npx prisma validate && npx prisma generate
npm run lint && npm run build && npm test
test -f prisma/migrations/migration_lock.toml
node -e "const s=require('fs').readFileSync('prisma/schema.prisma','utf8');['model User','model Project','model ProjectMember','model Feature','model WeeklyUpdate','model PlanDoc','model Question'].forEach(m=>{if(!s.includes(m))process.exit(1)})"
```
`DATABASE_URL`이 있으면 추가로: `npx prisma db seed` 후 프로젝트 21개, Feature 87개가 존재해야 한다.

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - ARCHITECTURE.md 데이터 모델과 필드가 일치하는가?
   - Prisma 6.x인가?
   - `src/lib/db.ts` 외에 PrismaClient 생성이 없는가?
3. 결과에 따라 `phases/0-setup/index.json`의 step 1을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary"`에 DATABASE_URL 유무와 시드 실행 여부를 포함해 기록
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason"` 후 즉시 중단. 단, DATABASE_URL 부재만으로는 blocked 처리하지 않는다 (SQL 생성 경로로 진행).

## 금지사항

- 진행률 컬럼을 Project에 추가하지 마라. 이유: ADR-005, 진행률은 Feature.done 비율로 계산한다.
- 시드에서 프로젝트 상태를 UNASSIGNED 외의 값으로 넣지 마라. 이유: 배치는 운영진이 대시보드에서 한다.
- 시드 재실행 시 기존 Feature를 삭제하거나 덮어쓰지 마라. 이유: 팀이 편집한 체크리스트가 사라진다.
- 기존 테스트를 깨뜨리지 마라.
