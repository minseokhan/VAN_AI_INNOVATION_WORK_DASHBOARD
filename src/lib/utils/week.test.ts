import { describe, expect, it } from "vitest";
import { formatDate } from "./date";
import { formatWeekLabel, getWeekStart, isCurrentWeek } from "./week";

describe("getWeekStart", () => {
  it("주중 날짜 → 그 주 월요일(KST), 날짜만 남기고 UTC 자정으로 정규화", () => {
    const ws = getWeekStart(new Date("2026-09-16T03:00:00Z")); // KST 수 12:00
    expect(ws.toISOString()).toBe("2026-09-14T00:00:00.000Z");
    expect(formatDate(ws)).toBe("2026-09-14");
  });
  it("월요일 00:00 KST는 그 주 월요일", () => {
    expect(getWeekStart(new Date("2026-09-13T15:00:00Z")).toISOString()).toBe("2026-09-14T00:00:00.000Z");
  });
  it("일요일 23:59 KST는 지난 월요일", () => {
    expect(getWeekStart(new Date("2026-09-13T14:59:00Z")).toISOString()).toBe("2026-09-07T00:00:00.000Z");
  });
  it("이미 월요일 자정(UTC)인 값은 그대로", () => {
    expect(getWeekStart(new Date("2026-09-14T00:00:00Z")).toISOString()).toBe("2026-09-14T00:00:00.000Z");
  });
  it("월 경계를 넘어 지난달 월요일로", () => {
    expect(getWeekStart(new Date("2026-10-01T03:00:00Z")).toISOString()).toBe("2026-09-28T00:00:00.000Z");
  });
});

describe("formatWeekLabel", () => {
  it("'9월 3주차 (9/15~9/21)' 형식, 주차는 그 달의 몇 번째 월요일인지", () => {
    expect(formatWeekLabel(new Date("2025-09-15T00:00:00Z"))).toBe("9월 3주차 (9/15~9/21)");
    expect(formatWeekLabel(new Date("2026-09-14T00:00:00Z"))).toBe("9월 2주차 (9/14~9/20)");
    expect(formatWeekLabel(new Date("2026-01-05T00:00:00Z"))).toBe("1월 1주차 (1/5~1/11)");
  });
  it("주 끝이 다음 달로 넘어가도 시작 월 기준", () => {
    expect(formatWeekLabel(new Date("2026-09-28T00:00:00Z"))).toBe("9월 4주차 (9/28~10/4)");
  });
});

describe("isCurrentWeek", () => {
  it("같은 주면 true, 지난 주면 false", () => {
    const now = new Date("2026-09-16T03:00:00Z");
    expect(isCurrentWeek(new Date("2026-09-14T00:00:00Z"), now)).toBe(true);
    expect(isCurrentWeek(new Date("2026-09-07T00:00:00Z"), now)).toBe(false);
  });
  it("경계: 일요일 23:59 KST까지 이번 주, 월요일 00:00 KST부터 다음 주", () => {
    const ws = new Date("2026-09-14T00:00:00Z");
    expect(isCurrentWeek(ws, new Date("2026-09-20T14:59:00Z"))).toBe(true);
    expect(isCurrentWeek(ws, new Date("2026-09-20T15:00:00Z"))).toBe(false);
  });
});
