import { describe, expect, it } from "vitest";
import { MAX_NOTICE, validateNotice } from "./rules";

describe("validateNotice", () => {
  const ok = { title: "9월 정기 모임 안내", content: "9월 27일 토요일 오후 2시, 학생회관 3층" };

  it("제목·내용이 있으면 통과하고 앞뒤 공백을 지운다", () => {
    const r = validateNotice({ title: "  제목  ", content: "  본문\n둘째 줄  " });
    expect(r).toEqual({ ok: true, value: { title: "제목", content: "본문\n둘째 줄" } });
  });

  it("제목이 비면 에러", () => {
    expect(validateNotice({ ...ok, title: "   " })).toEqual({ ok: false, errors: { title: "제목을 입력하세요" } });
  });

  it("내용이 비면 에러", () => {
    expect(validateNotice({ ...ok, content: "" })).toEqual({ ok: false, errors: { content: "내용을 입력하세요" } });
  });

  it("제목 길이 상한", () => {
    const r = validateNotice({ ...ok, title: "가".repeat(MAX_NOTICE.title + 1) });
    expect(r).toEqual({ ok: false, errors: { title: `제목은 ${MAX_NOTICE.title}자 이하로 입력하세요` } });
  });

  it("내용 길이 상한", () => {
    const r = validateNotice({ ...ok, content: "가".repeat(MAX_NOTICE.content + 1) });
    expect(r).toEqual({ ok: false, errors: { content: `내용은 ${MAX_NOTICE.content}자 이하로 입력하세요` } });
  });

  it("제목·내용이 동시에 잘못되면 둘 다 알려준다", () => {
    const r = validateNotice({ title: "", content: "" });
    expect(r).toEqual({ ok: false, errors: { title: "제목을 입력하세요", content: "내용을 입력하세요" } });
  });

  it("길이는 공백을 제거한 기준으로 센다", () => {
    expect(validateNotice({ title: `  ${"가".repeat(MAX_NOTICE.title)}  `, content: "본문" }).ok).toBe(true);
  });
});
