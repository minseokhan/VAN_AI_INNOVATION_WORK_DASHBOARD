import { describe, expect, it } from "vitest";
import { getInitials } from "./initials";

describe("getInitials", () => {
  it("한글 이름은 첫 글자", () => {
    expect(getInitials("한민석")).toBe("한");
  });
  it("공백으로 나뉜 이름은 각 첫 글자 대문자 2개", () => {
    expect(getInitials("Kim Minji")).toBe("KM");
    expect(getInitials("kim minji lee")).toBe("KM");
  });
  it("영문 한 단어는 첫 글자 대문자", () => {
    expect(getInitials("alice")).toBe("A");
  });
  it("빈 문자열/공백은 ?", () => {
    expect(getInitials("")).toBe("?");
    expect(getInitials("   ")).toBe("?");
  });
});
