import { describe, expect, it } from "vitest";
import { linkify } from "./linkify";

describe("linkify", () => {
  it("URL이 없으면 텍스트 하나", () => {
    expect(linkify("그냥 글")).toEqual([{ type: "text", value: "그냥 글" }]);
  });
  it("http/https URL을 링크 세그먼트로 분리", () => {
    expect(linkify("참고: https://example.com/a?b=1 와 http://x.io 끝")).toEqual([
      { type: "text", value: "참고: " },
      { type: "link", value: "https://example.com/a?b=1" },
      { type: "text", value: " 와 " },
      { type: "link", value: "http://x.io" },
      { type: "text", value: " 끝" },
    ]);
  });
  it("URL 끝의 문장부호는 링크에서 제외", () => {
    expect(linkify("보기(https://a.b/c).")).toEqual([
      { type: "text", value: "보기(" },
      { type: "link", value: "https://a.b/c" },
      { type: "text", value: ")." },
    ]);
  });
  it("빈 문자열 → 빈 배열", () => {
    expect(linkify("")).toEqual([]);
  });
});
