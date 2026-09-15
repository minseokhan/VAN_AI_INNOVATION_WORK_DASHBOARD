import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { safeFileName, validateUploadFile } from "@/lib/plan-docs/validation";

export async function POST(req: Request) {
  try {
    await requireAdmin();
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
  const fd = await req.formData();
  const file = fd.get("file");
  const projectId = String(fd.get("projectId") ?? "");
  if (!(file instanceof File) || !projectId) return NextResponse.json({ error: "파일과 프로젝트가 필요합니다" }, { status: 400 });
  const error = validateUploadFile(file.name, file.size);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const name = safeFileName(file.name);
  const { url } = await put(`plan-docs/${projectId}/${name}`, file, { access: "public", addRandomSuffix: true });
  return NextResponse.json({ url, name });
}
