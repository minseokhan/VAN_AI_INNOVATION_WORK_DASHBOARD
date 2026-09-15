import { describe, expect, it } from "vitest";
import { formatDate, relativeDays } from "./date";

describe("formatDate", () => {
  it("YYYY-MM-DD (KST 기준)", () => {
    expect(formatDate(new Date("2026-09-15T00:00:00Z"))).toBe("2026-09-15");
    expect(formatDate("2026-01-05T12:00:00Z")).toBe("2026-01-05");
  });
  it("UTC 자정 직전은 KST로 다음 날", () => {
    expect(formatDate(new Date("2026-09-15T20:00:00Z"))).toBe("2026-09-16");
  });
});

describe("relativeDays", () => {
  const now = new Date("2026-09-15T03:00:00Z");
  it("같은 날은 오늘", () => {
    expect(relativeDays("2026-09-15T00:00:00Z", now)).toBe("오늘");
  });
  it("과거는 N일 전", () => {
    expect(relativeDays("2026-09-12T00:00:00Z", now)).toBe("3일 전");
    expect(relativeDays(new Date("2026-09-14T00:00:00Z"), now)).toBe("1일 전");
  });
  it("미래는 N일 후", () => {
    expect(relativeDays("2026-09-17T00:00:00Z", now)).toBe("2일 후");
  });
  it("시각이 달라도 날짜 차이로 센다", () => {
    expect(relativeDays("2026-09-14T14:59:00Z", now)).toBe("1일 전"); // KST 09/14 23:59
    expect(relativeDays("2026-09-14T15:00:00Z", now)).toBe("오늘"); // KST 09/15 00:00
  });
});
