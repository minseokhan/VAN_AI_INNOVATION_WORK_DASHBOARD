import { describe, expect, it } from "vitest";
import { MAX_MINUTE_TITLE, monthRange, validateMinute } from "./rules";

describe("validateMinute", () => {
  const ok = { date: "2026-10-06", title: "10월 1주차 정기 회의", fileUrl: "https://docs.google.com/document/d/abc/edit" };

  it("날짜·제목·파일이 있으면 통과하고 날짜를 UTC 자정 Date로 바꾼다", () => {
    expect(validateMinute({ ...ok, title: "  제목  " })).toEqual({
      ok: true,
      value: { date: new Date("2026-10-06T00:00:00Z"), title: "제목", fileUrl: ok.fileUrl },
    });
  });

  it("날짜 형식이 아니거나 없는 날짜면 에러", () => {
    expect(validateMinute({ ...ok, date: "" })).toEqual({ ok: false, errors: { date: "회의 날짜를 선택하세요" } });
    expect(validateMinute({ ...ok, date: "2026-02-30" })).toEqual({ ok: false, errors: { date: "회의 날짜를 선택하세요" } });
  });

  it("제목이 비거나 길면 에러", () => {
    expect(validateMinute({ ...ok, title: " " })).toEqual({ ok: false, errors: { title: "제목을 입력하세요" } });
    expect(validateMinute({ ...ok, title: "가".repeat(MAX_MINUTE_TITLE + 1) })).toEqual({
      ok: false,
      errors: { title: `제목은 ${MAX_MINUTE_TITLE}자 이하로 입력하세요` },
    });
  });

  it("링크가 없거나 https가 아니면 에러", () => {
    const errors = { fileUrl: "회의록 링크를 https:// 주소로 입력하세요" };
    expect(validateMinute({ ...ok, fileUrl: "" })).toEqual({ ok: false, errors });
    expect(validateMinute({ ...ok, fileUrl: "docs.google.com/document/d/x" })).toEqual({ ok: false, errors });
    expect(validateMinute({ ...ok, fileUrl: "javascript:alert(1)" })).toEqual({ ok: false, errors });
  });
});

describe("monthRange", () => {
  it("해당 월 1일 이상, 다음 달 1일 미만", () => {
    expect(monthRange("2026-10")).toEqual({ gte: new Date("2026-10-01T00:00:00Z"), lt: new Date("2026-11-01T00:00:00Z") });
  });

  it("12월은 다음 해 1월까지", () => {
    expect(monthRange("2026-12")).toEqual({ gte: new Date("2026-12-01T00:00:00Z"), lt: new Date("2027-01-01T00:00:00Z") });
  });
});
