export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const ALLOWED_EXT = ["pdf", "docx", "pptx", "xlsx", "md", "txt", "png", "jpg", "jpeg", "zip"];

function ext(name: string): string {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(i + 1).toLowerCase() : "";
}

function isHttpUrl(s: string): boolean {
  try {
    return ["http:", "https:"].includes(new URL(s).protocol);
  } catch {
    return false;
  }
}

/** 확장자·크기 검사. 문제 없으면 null */
export function validateUploadFile(name: string, size: number): string | null {
  if (!ALLOWED_EXT.includes(ext(name))) return `허용되지 않은 파일 형식입니다 (${ALLOWED_EXT.join(", ")})`;
  if (size <= 0) return "빈 파일은 업로드할 수 없습니다";
  if (size > MAX_FILE_BYTES) return "파일 크기는 20MB 이하여야 합니다";
  return null;
}

export function validatePlanLink(title: string, url: string): { ok: true } | { ok: false; errors: { title?: string; url?: string } } {
  const errors: { title?: string; url?: string } = {};
  const t = title.trim();
  if (t.length < 1 || t.length > 100) errors.title = "제목은 1~100자여야 합니다";
  if (!isHttpUrl(url.trim())) errors.url = "http(s) URL만 입력할 수 있습니다";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true };
}

/** 경로 문자 제거, 공백 → "-", 확장자를 보존하며 100자 제한 */
export function safeFileName(name: string): string {
  const cleaned = name
    .replace(/[\\/]/g, "")
    .replace(/\.{2,}/g, "")
    .replace(/[\x00-\x1f]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  if (!cleaned) return "file";
  const e = ext(cleaned);
  const base = e ? cleaned.slice(0, cleaned.length - e.length - 1) : cleaned;
  const suffix = e ? `.${e}` : "";
  return base.slice(0, 100 - suffix.length) + suffix;
}
