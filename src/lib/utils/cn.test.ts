import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("공백으로 join한다", () => {
    expect(cn("a", "b")).toBe("a b");
  });
  it("falsy 값을 거른다", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
  });
  it("인자가 없으면 빈 문자열", () => {
    expect(cn()).toBe("");
  });
});
