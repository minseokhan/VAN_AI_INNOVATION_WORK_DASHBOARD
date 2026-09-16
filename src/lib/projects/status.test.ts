import { describe, expect, it } from "vitest";
import { deriveStatusAfterAssign } from "./status";

describe("deriveStatusAfterAssign", () => {
  it("멤버가 0명이면 항상 UNASSIGNED", () => {
    expect(deriveStatusAfterAssign("IN_PROGRESS", 0)).toBe("UNASSIGNED");
    expect(deriveStatusAfterAssign("DONE", 0)).toBe("UNASSIGNED");
    expect(deriveStatusAfterAssign("UNASSIGNED", 0)).toBe("UNASSIGNED");
  });

  it("UNASSIGNED에서 첫 배치 시 IN_PROGRESS", () => {
    expect(deriveStatusAfterAssign("UNASSIGNED", 1)).toBe("IN_PROGRESS");
  });

  it("DONE은 멤버가 있으면 DONE 유지", () => {
    expect(deriveStatusAfterAssign("DONE", 2)).toBe("DONE");
  });

  it("IN_PROGRESS는 멤버가 있으면 그대로", () => {
    expect(deriveStatusAfterAssign("IN_PROGRESS", 3)).toBe("IN_PROGRESS");
  });
});
