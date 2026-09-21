import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireAdmin, requireUser } from "@/lib/auth/guards";
import { safeFileName, validateUploadFile } from "@/lib/plan-docs/validation";
import type { SessionUser } from "@/lib/auth/session";

export async function POST(req: Request) {
  const fd = await req.formData();
  const file = fd.get("file");
  const projectId = String(fd.get("projectId") ?? "");
  const isReceipt = fd.get("kind") === "receipt";

  // projectId가 있으면 프로젝트 기획안(운영진 전용), 없으면 본인 포트폴리오·영수증
  let user: SessionUser;
  try {
    user = projectId ? await requireAdmin() : await requireUser();
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") return NextResponse.json({ error: "운영진만 업로드할 수 있습니다" }, { status: 403 });
    if (typeof (e as { digest?: string }).digest === "string" && (e as { digest: string }).digest.startsWith("NEXT_REDIRECT")) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }
    throw e;
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "파일 저장소가 설정되지 않았습니다. 링크로 등록해 주세요." }, { status: 503 });
  }
  if (!(file instanceof File)) return NextResponse.json({ error: "파일이 필요합니다" }, { status: 400 });
  const error = validateUploadFile(file.name, file.size);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const name = safeFileName(file.name);
  const path = projectId ? `plan-docs/${projectId}/${name}` : `${isReceipt ? "receipts" : "profiles"}/${user.id}/${name}`;
  const { url } = await put(path, file, { access: "public", addRandomSuffix: true });
  return NextResponse.json({ url, name });
}
