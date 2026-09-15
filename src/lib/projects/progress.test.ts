import { describe, expect, it } from "vitest";
import { calcProgress } from "./progress";

describe("calcProgress", () => {
  it("항목 0개면 0", () => {
    expect(calcProgress([])).toBe(0);
  });
  it("완료 비율을 0~100 정수로 반올림", () => {
    expect(calcProgress([{ done: true }, { done: false }, { done: false }])).toBe(33);
    expect(calcProgress([{ done: true }, { done: true }, { done: false }])).toBe(67);
    expect(calcProgress([{ done: true }, { done: true }])).toBe(100);
    expect(calcProgress([{ done: false }])).toBe(0);
  });
});
