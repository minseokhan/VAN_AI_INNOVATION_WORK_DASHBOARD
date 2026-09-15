import { describe, expect, it } from "vitest";
import {
  LANGUAGE_OPTIONS,
  parseProjectInfoForm,
  parseWeeklyForm,
  validateProjectInfo,
  validateWeekly,
} from "./info";

describe("LANGUAGE_OPTIONS", () => {
  it("8개, 마지막은 기타", () => {
    expect(LANGUAGE_OPTIONS).toHaveLength(8);
    expect(LANGUAGE_OPTIONS[0]).toBe("TypeScript");
    expect(LANGUAGE_OPTIONS.at(-1)).toBe("기타");
  });
});

describe("validateProjectInfo", () => {
  it("빈 값은 전부 null로 정규화", () => {
    const r = validateProjectInfo({ githubUrl: "", deployUrl: "", mainLanguage: "", infraNote: "", startedAt: "" });
    expect(r).toEqual({
      ok: true,
      value: { githubUrl: null, deployUrl: null, mainLanguage: null, infraNote: null, startedAt: null },
    });
  });
  it("정상 입력은 그대로 통과", () => {
    const r = validateProjectInfo({
      githubUrl: "https://github.com/van/ai",
      deployUrl: "http://localhost:3000",
      mainLanguage: "Python",
      infraNote: "Vercel + Neon",
      startedAt: "2026-09-14",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.startedAt).toBe("2026-09-14");
  });
  it("URL은 http(s)만 허용", () => {
    const r = validateProjectInfo({ githubUrl: "ftp://x.com", deployUrl: "javascript:alert(1)" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.githubUrl).toBeTruthy();
      expect(r.errors.deployUrl).toBeTruthy();
      expect(r.errors.infraNote).toBeUndefined();
    }
  });
  it("infraNote 500자 초과, mainLanguage 30자 초과, startedAt 형식 오류", () => {
    const r = validateProjectInfo({ infraNote: "a".repeat(501), mainLanguage: "a".repeat(31), startedAt: "2026/09/14" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["infraNote", "mainLanguage", "startedAt"]);
  });
  it("infraNote 500자는 허용", () => {
    expect(validateProjectInfo({ infraNote: "a".repeat(500) }).ok).toBe(true);
  });
});

describe("parseProjectInfoForm", () => {
  const fd = (o: Record<string, string>) => {
    const f = new FormData();
    for (const [k, v] of Object.entries(o)) f.set(k, v);
    return f;
  };
  it("trim 후 필드 추출", () => {
    expect(parseProjectInfoForm(fd({ githubUrl: " https://g.com ", mainLanguage: "Go" }))).toEqual({
      githubUrl: "https://g.com",
      deployUrl: "",
      mainLanguage: "Go",
      infraNote: "",
      startedAt: "",
    });
  });
  it("mainLanguage가 기타면 직접 입력값 사용", () => {
    expect(parseProjectInfoForm(fd({ mainLanguage: "기타", mainLanguageOther: " Rust " })).mainLanguage).toBe("Rust");
  });
});

describe("validateWeekly", () => {
  it("필수 필드 비면 에러", () => {
    const r = validateWeekly({ didThisWeek: "", planNextWeek: "  " });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["didThisWeek", "planNextWeek"]);
  });
  it("2000자 초과 에러, issues 비면 null", () => {
    const r1 = validateWeekly({ didThisWeek: "a".repeat(2001), planNextWeek: "b", issues: "c".repeat(2001) });
    expect(r1.ok).toBe(false);
    if (!r1.ok) expect(Object.keys(r1.errors).sort()).toEqual(["didThisWeek", "issues"]);
    const r2 = validateWeekly({ didThisWeek: "a", planNextWeek: "b", issues: "" });
    expect(r2).toEqual({ ok: true, value: { didThisWeek: "a", planNextWeek: "b", issues: null } });
  });
});

describe("parseWeeklyForm", () => {
  it("세 필드 trim", () => {
    const f = new FormData();
    f.set("didThisWeek", " 했음 ");
    f.set("planNextWeek", "할 것");
    expect(parseWeeklyForm(f)).toEqual({ didThisWeek: "했음", planNextWeek: "할 것", issues: "" });
  });
});
