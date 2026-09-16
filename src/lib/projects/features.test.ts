import { describe, expect, it } from "vitest";
import { canTransitionStatus, nextOrder, validateFeatureTitle } from "./features";

describe("nextOrder", () => {
  it("빈 배열 → 0", () => {
    expect(nextOrder([])).toBe(0);
  });
  it("max + 1", () => {
    expect(nextOrder([{ order: 3 }, { order: 7 }, { order: 1 }])).toBe(8);
  });
});

describe("validateFeatureTitle", () => {
  it("정상이면 null", () => {
    expect(validateFeatureTitle("로그인 화면")).toBeNull();
    expect(validateFeatureTitle("  a  ")).toBeNull();
    expect(validateFeatureTitle("x".repeat(120))).toBeNull();
  });
  it("trim 후 비면 에러", () => {
    expect(validateFeatureTitle("")).toMatch(/입력/);
    expect(validateFeatureTitle("   ")).toMatch(/입력/);
  });
  it("120자 초과면 에러", () => {
    expect(validateFeatureTitle("x".repeat(121))).toMatch(/120/);
  });
});

describe("canTransitionStatus", () => {
  it("IN_PROGRESS ↔ DONE 허용", () => {
    expect(canTransitionStatus("IN_PROGRESS", "DONE", 1)).toBe(true);
    expect(canTransitionStatus("DONE", "IN_PROGRESS", 2)).toBe(true);
  });
  it("멤버 0명이면 불가", () => {
    expect(canTransitionStatus("IN_PROGRESS", "DONE", 0)).toBe(false);
    expect(canTransitionStatus("DONE", "IN_PROGRESS", 0)).toBe(false);
  });
  it("UNASSIGNED 에서/로의 수동 전이 불가", () => {
    expect(canTransitionStatus("UNASSIGNED", "IN_PROGRESS", 1)).toBe(false);
    expect(canTransitionStatus("UNASSIGNED", "DONE", 1)).toBe(false);
    expect(canTransitionStatus("IN_PROGRESS", "UNASSIGNED", 1)).toBe(false);
  });
  it("같은 상태로는 불가", () => {
    expect(canTransitionStatus("DONE", "DONE", 1)).toBe(false);
  });
});
