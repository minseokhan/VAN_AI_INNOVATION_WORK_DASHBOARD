import { describe, expect, it } from "vitest";
import { ALLOWED_EXT, MAX_FILE_BYTES, safeFileName, validatePlanLink, validateUploadFile } from "./validation";

describe("상수", () => {
  it("20MB, 확장자 10종", () => {
    expect(MAX_FILE_BYTES).toBe(20 * 1024 * 1024);
    expect(ALLOWED_EXT).toEqual(["pdf", "docx", "pptx", "xlsx", "md", "txt", "png", "jpg", "jpeg", "zip"]);
  });
});

describe("validateUploadFile", () => {
  it("허용 확장자 + 크기 이내면 null (대소문자 무시)", () => {
    expect(validateUploadFile("기획안.pdf", 1024)).toBeNull();
    expect(validateUploadFile("A.PDF", MAX_FILE_BYTES)).toBeNull();
  });
  it("허용되지 않은 확장자·확장자 없음은 에러", () => {
    expect(validateUploadFile("virus.exe", 10)).toMatch(/확장자|형식/);
    expect(validateUploadFile("noext", 10)).toMatch(/확장자|형식/);
  });
  it("20MB 초과·빈 파일은 에러", () => {
    expect(validateUploadFile("a.pdf", MAX_FILE_BYTES + 1)).toMatch(/20MB/);
    expect(validateUploadFile("a.pdf", 0)).toBeTruthy();
  });
});

describe("validatePlanLink", () => {
  it("정상", () => {
    expect(validatePlanLink("기획안 v1", "https://docs.google.com/x")).toEqual({ ok: true });
  });
  it("title 1~100자, url http(s)만", () => {
    const r = validatePlanLink("   ", "ftp://x");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.title).toBeTruthy();
      expect(r.errors.url).toBeTruthy();
    }
    const r2 = validatePlanLink("a".repeat(101), "https://x.com");
    expect(r2.ok).toBe(false);
    if (!r2.ok) expect(Object.keys(r2.errors)).toEqual(["title"]);
  });
});

describe("safeFileName", () => {
  it("공백 → '-', 경로 문자 제거", () => {
    expect(safeFileName("기획안 v1 최종.pdf")).toBe("기획안-v1-최종.pdf");
    expect(safeFileName("../a/b\\c.pdf")).toBe("abc.pdf");
  });
  it("100자 제한, 확장자는 보존", () => {
    const out = safeFileName("a".repeat(150) + ".pdf");
    expect(out).toHaveLength(100);
    expect(out.endsWith(".pdf")).toBe(true);
  });
  it("빈 이름은 file", () => {
    expect(safeFileName("")).toBe("file");
  });
});
