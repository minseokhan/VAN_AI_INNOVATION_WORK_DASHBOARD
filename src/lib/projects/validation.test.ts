import { describe, expect, it } from "vitest";
import { parseProjectForm, validateProject, type ProjectInput } from "./validation";

const valid: ProjectInput = {
  code: "2-1",
  title: "출석 관리",
  category: "운영",
  priority: "上",
  summary: "QR 체크인",
  description: "",
  dueDate: "",
};

describe("validateProject", () => {
  it("정상 입력은 ok", () => {
    expect(validateProject(valid)).toEqual({ ok: true, value: valid });
    expect(validateProject({ ...valid, code: "7", dueDate: "2026-12-31" }).ok).toBe(true);
    expect(validateProject({ ...valid, dueDate: undefined }).ok).toBe(true);
  });
  const bad = (over: Partial<ProjectInput>) => {
    const r = validateProject({ ...valid, ...over });
    return r.ok ? {} : r.errors;
  };
  it("code 형식", () => {
    expect(bad({ code: "" })).toHaveProperty("code");
    expect(bad({ code: "a-1" })).toHaveProperty("code");
    expect(bad({ code: "2-1-1" })).toHaveProperty("code");
    expect(bad({ code: "2-" })).toHaveProperty("code");
  });
  it("title 1~80", () => {
    expect(bad({ title: "" })).toHaveProperty("title");
    expect(bad({ title: "x".repeat(81) })).toHaveProperty("title");
    expect(bad({ title: "x".repeat(80) })).not.toHaveProperty("title");
  });
  it("category 1~30", () => {
    expect(bad({ category: "" })).toHaveProperty("category");
    expect(bad({ category: "x".repeat(31) })).toHaveProperty("category");
  });
  it("priority ∈ PRIORITY_ORDER", () => {
    expect(bad({ priority: "높음" })).toHaveProperty("priority");
    expect(bad({ priority: "중장기" })).not.toHaveProperty("priority");
  });
  it("summary 1~200", () => {
    expect(bad({ summary: "" })).toHaveProperty("summary");
    expect(bad({ summary: "x".repeat(201) })).toHaveProperty("summary");
  });
  it("description 0~5000", () => {
    expect(bad({ description: "x".repeat(5001) })).toHaveProperty("description");
    expect(bad({ description: "x".repeat(5000) })).not.toHaveProperty("description");
  });
  it("dueDate 빈 문자열 또는 YYYY-MM-DD", () => {
    expect(bad({ dueDate: "2026/12/31" })).toHaveProperty("dueDate");
    expect(bad({ dueDate: "26-12-31" })).toHaveProperty("dueDate");
    expect(bad({ dueDate: "2026-13-45" })).toHaveProperty("dueDate");
  });
  it("여러 에러를 동시에 반환", () => {
    const errors = bad({ code: "", title: "", summary: "" });
    expect(Object.keys(errors).sort()).toEqual(["code", "summary", "title"]);
  });
});

describe("parseProjectForm", () => {
  it("FormData에서 trim해 읽는다, 없는 값은 빈 문자열", () => {
    const fd = new FormData();
    fd.set("code", " 2-1 ");
    fd.set("title", " 출석 ");
    fd.set("category", "운영");
    fd.set("priority", "上");
    fd.set("summary", " 요약 ");
    expect(parseProjectForm(fd)).toEqual({
      code: "2-1",
      title: "출석",
      category: "운영",
      priority: "上",
      summary: "요약",
      description: "",
      dueDate: "",
    });
  });
});
