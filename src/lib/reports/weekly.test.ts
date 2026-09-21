import { describe, expect, it } from "vitest";
import { parseWeekParam, shiftWeek } from "./weekly";

const NOW = new Date("2026-09-17T03:00:00Z"); // KST 목 12:00 → 이번 주 월요일 2026-09-14
const ymd = (d: Date) => d.toISOString().slice(0, 10);

describe("parseWeekParam", () => {
  it("YYYY-MM-DD를 그 주 월요일(UTC 자정)로 정규화한다", () => {
    expect(parseWeekParam("2026-09-10", NOW).toISOString()).toBe("2026-09-07T00:00:00.000Z");
  });

  it("이미 월요일이면 그대로 둔다", () => {
    expect(parseWeekParam("2026-09-07", NOW).toISOString()).toBe("2026-09-07T00:00:00.000Z");
  });

  it("값이 없거나 형식이 틀리면 이번 주 월요일로 폴백한다", () => {
    for (const raw of [undefined, "", "2026-13-01", "지난주", "2026-09-10T00:00:00Z"]) {
      expect(parseWeekParam(raw, NOW).toISOString()).toBe("2026-09-14T00:00:00.000Z");
    }
  });
});

describe("shiftWeek", () => {
  it("주 단위로 이동한다", () => {
    expect(ymd(shiftWeek(new Date("2026-09-14"), -1))).toBe("2026-09-07");
    expect(ymd(shiftWeek(new Date("2026-09-14"), 1))).toBe("2026-09-21");
  });

  it("월 경계를 넘어간다", () => {
    expect(ymd(shiftWeek(new Date("2026-09-07"), -1))).toBe("2026-08-31");
  });
});
