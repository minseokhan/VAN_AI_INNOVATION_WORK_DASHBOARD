# Step 1: plan-docs

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/CLAUDE.md`
- `/docs/PRD.md` (3. 기획안, 4. 운영진 기능 — 기획안 업로드)
- `/docs/ADR.md` (ADR-006)
- `/docs/ARCHITECTURE.md` (데이터 흐름 — 기획안 파일)
- `/src/lib/auth/guards.ts` (requireAdmin)
- `/src/app/(dashboard)/projects/[id]/page.tsx` (기획안 섹션), `actions.ts`
- `/.env.example` (BLOB_READ_WRITE_TOKEN)

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

1. **검증 (TDD, `src/lib/plan-docs/validation.ts`)**
   ```ts
   export const MAX_FILE_BYTES = 20 * 1024 * 1024
   export const ALLOWED_EXT = ["pdf", "docx", "pptx", "xlsx", "md", "txt", "png", "jpg", "jpeg", "zip"]
   export function validateUploadFile(name: string, size: number): string | null     // 확장자·크기 검사, 에러 메시지 or null
   export function validatePlanLink(title: string, url: string): { ok: true } | { ok: false; errors: { title?: string; url?: string } }
   // title 1~100자, url http(s)만
   export function safeFileName(name: string): string   // 경로 문자 제거, 공백 → "-", 100자 제한
   ```
2. **업로드 Route Handler** `src/app/api/upload/route.ts` (POST, multipart):
   - 첫 줄 `requireAdmin()` (실패 시 401/403 JSON).
   - `BLOB_READ_WRITE_TOKEN`이 없으면 503 `{ error: "파일 저장소가 설정되지 않았습니다. 링크로 등록해 주세요." }`.
   - `validateUploadFile` → `put(\`plan-docs/${projectId}/${safeFileName}\`, file, { access: "public", addRandomSuffix: true })` → `{ url, name }` 반환.
3. **Server Actions** (`src/app/(dashboard)/projects/[id]/actions.ts`에 추가) — 첫 줄 `requireAdmin()`.
   ```ts
   export async function addPlanDoc(projectId: string, input: { kind: "FILE" | "LINK"; title: string; url: string }): Promise<{ error?: string }>
   export async function deletePlanDoc(projectId: string, planDocId: string): Promise<{ error?: string }>   // FILE이면 @vercel/blob del()도 시도, 실패해도 DB 삭제는 진행
   ```
4. **UI** `src/components/projects/PlanDocs.tsx` (client)로 사이드 패널 "기획안" 섹션 교체:
   - 목록: kind 아이콘(FileText / Link2) + 제목(새 탭 링크) + 업로더 이름 · 날짜. ADMIN에게 삭제 X 버튼(ConfirmButton).
   - ADMIN에게 "추가" 텍스트 버튼 → 인라인 폼, 탭 "파일" / "링크" 전환.
     - 파일 탭: 제목 Input(비우면 파일명), `<input type="file" accept=".pdf,.docx,...">` → 클라이언트에서 `validateUploadFile` 선검사 → `fetch("/api/upload")` → 성공 시 `addPlanDoc(kind FILE)`. 업로드 중 버튼 비활성 + "업로드 중…" 텍스트. 503이면 에러 문구 표시하고 링크 탭 안내.
     - 링크 탭: 제목, URL → `addPlanDoc(kind LINK)`.
5. 프로젝트 목록 카드에는 변경 없음.

## Acceptance Criteria

```bash
npm test
npm run lint && npm run build
ls src/lib/plan-docs/validation.test.ts src/app/api/upload/route.ts src/components/projects/PlanDocs.tsx
```
DATABASE_URL이 있으면 수동 확인: 운영진으로 링크 기획안 추가/삭제. BLOB 토큰이 있으면 pdf 업로드 → 새 탭에서 열림. 부원 계정에는 추가 버튼 미표시 + `/api/upload` 직접 호출 시 403.

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - Route Handler와 action 모두 서버에서 `requireAdmin()`을 호출하는가?
   - 파일 확장자·크기 검사가 서버에서도 수행되는가? (클라이언트 선검사만으로는 부족)
   - Blob 토큰 부재가 앱 전체를 깨뜨리지 않고 링크 등록은 계속 가능한가?
3. 결과에 따라 `phases/5-progress/index.json`의 step 1을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary"`에 Blob 토큰 유무를 기록
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason"` 후 즉시 중단. 단, BLOB 토큰 부재만으로는 blocked 처리하지 않는다.

## 금지사항

- 파일을 로컬 디스크(`public/uploads` 등)에 저장하지 마라. 이유: Vercel 서버리스에서 유실된다 (ADR-006).
- 기획안 버전 관리, 미리보기 렌더링을 추가하지 마라. 이유: 요청되지 않았다.
- 부원에게 기획안 업로드 권한을 주지 마라. 이유: PRD, 운영진 전용.
- 기존 테스트를 깨뜨리지 마라.
