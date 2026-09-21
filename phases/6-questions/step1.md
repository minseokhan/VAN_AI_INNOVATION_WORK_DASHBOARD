# Step 1: discord-digest

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/CLAUDE.md`
- `/docs/PRD.md` (5. 질문 — 디스코드 다이제스트)
- `/docs/ADR.md` (ADR-007)
- `/docs/ARCHITECTURE.md` (데이터 흐름 — 질문 다이제스트)
- `/vercel.json`, `/.env.example` (DISCORD_WEBHOOK_URL, DISCORD_PLANNER_ROLE_ID, CRON_SECRET)
- `/src/app/(dashboard)/questions/page.tsx`, `actions.ts` (step 0 산출물)
- `/src/lib/db.ts`

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

1. **메시지 조립 (TDD, `src/lib/discord/digest.ts`)** — 순수 함수.
   ```ts
   export type DigestQuestion = { id: string; content: string; createdAt: Date; authorName: string; projectCode: string; projectTitle: string; projectId: string }
   export function buildDigestMessages(qs: DigestQuestion[], opts: { roleId?: string; baseUrl: string; date: Date }): string[]
   ```
   - 형식: 첫 줄 `<@&ROLE_ID> 📋 **AI혁신부 기획 질문 다이제스트 (9/15)** — N건` (roleId 없으면 멘션 생략). 프로젝트별 그룹: `**[2-1] 컨퍼런스 사이트 운영 개선** · <baseUrl>/questions?project=<id>` 아래 각 질문 `• (작성자) 내용` — 내용은 200자에서 잘라 `…`.
   - 디스코드 메시지 한도 2000자를 넘지 않도록 프로젝트 그룹 단위로 여러 메시지로 분할. 첫 메시지에만 헤더. 빈 배열 → `[]`.
2. **전송** `src/lib/discord/webhook.ts`
   ```ts
   export async function sendWebhook(url: string, content: string): Promise<void>   // POST JSON { content, allowed_mentions: { parse: [], roles: [roleId] } }; 2xx 아니면 throw. 여러 메시지는 순차 전송(rate limit 대비 500ms 간격)
   ```
   테스트는 `vi.stubGlobal("fetch", ...)`로 호출 payload 검증.
3. **실행기** `src/lib/discord/run.ts`
   ```ts
   export async function runDigest(now?: Date): Promise<{ sent: number; skipped?: string }>
   // 환경변수 없으면 { sent: 0, skipped: "DISCORD_WEBHOOK_URL 미설정" }. sentToDiscordAt null인 질문 조회 → build → send → 성공한 뒤에만 updateMany(sentToDiscordAt=now). 전송 실패 시 throw (다음 실행에서 재시도됨)
   ```
   `baseUrl`은 `process.env.APP_BASE_URL ?? "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL`. `.env.example`에 `APP_BASE_URL=` 추가.
4. **Cron Route** `src/app/api/cron/digest/route.ts` (GET): `Authorization: Bearer ${CRON_SECRET}` 검증(불일치·미설정 → 401) → `runDigest()` → JSON 반환. Vercel Cron은 이 헤더를 자동으로 붙인다. `export const dynamic = "force-dynamic"`.
5. **수동 발송** (`src/app/(dashboard)/questions/actions.ts`에 추가)
   ```ts
   export async function sendDigestNow(): Promise<{ sent?: number; error?: string }>   // requireAdmin → runDigest
   ```
   질문 페이지 상단(ADMIN 전용)에 "미발송 N건 · 디스코드로 지금 보내기" Secondary 버튼(client, 결과를 옆에 텍스트로). N은 sentToDiscordAt null 개수.
6. middleware의 공개 경로에 `/api/cron`이 포함되어 있는지 확인(1-auth step 1에서 정의됨).

## Acceptance Criteria

```bash
npm test
npm run lint && npm run build
ls src/lib/discord/digest.test.ts src/lib/discord/webhook.test.ts src/lib/discord/run.test.ts src/app/api/cron/digest/route.ts
grep -q '"path": "/api/cron/digest"' vercel.json
```
환경변수가 모두 있으면 수동 확인: `curl -H "Authorization: Bearer $CRON_SECRET" localhost:3000/api/cron/digest` → 디스코드 채널에 메시지 + 기획자 역할 멘션. 재호출 시 `{ sent: 0 }`.

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - 메시지 조립이 순수 함수이고 2000자 분할 테스트가 있는가?
   - `sentToDiscordAt`가 전송 성공 후에만 기록되는가?
   - CRON_SECRET 미설정 시 route가 열려 있지 않은가? (401이어야 함)
3. 결과에 따라 `phases/6-questions/index.json`의 step 1을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary"`에 환경변수 유무 기록
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason"` 후 즉시 중단. 웹훅 URL 부재만으로는 blocked 처리하지 않는다(skipped 경로).

## 금지사항

- discord.js 등 봇 라이브러리를 추가하지 마라. 이유: ADR-007, 웹훅 POST면 충분하다.
- `allowed_mentions` 없이 전송하지 마라. 이유: 질문 본문에 `@everyone`이 들어가면 전체 멘션이 발생한다.
- 답변 내용을 디스코드에 보내지 마라. 이유: 다이제스트는 미발송 질문만 다룬다.
- 기존 테스트를 깨뜨리지 마라.
