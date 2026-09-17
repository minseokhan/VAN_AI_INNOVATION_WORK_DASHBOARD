import { describe, expect, it } from "vitest";
import { formatMonthLabel, monthOptions, parseWeekParam, shiftWeek, weeksInMonth } from "./weekly";

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

describe("monthOptions", () => {
  it("가장 이른 보고 달부터 이번 달까지 빠짐없이, 최신순으로 만든다", () => {
    expect(monthOptions([new Date("2026-07-27")], NOW)).toEqual(["2026-09", "2026-08", "2026-07"]);
  });

  it("보고가 없으면 이번 달만", () => {
    expect(monthOptions([], NOW)).toEqual(["2026-09"]);
  });

  it("이번 달보다 뒤의 보고가 있어도 그 달까지 포함한다", () => {
    expect(monthOptions([new Date("2026-10-05")], NOW)).toEqual(["2026-10", "2026-09"]);
  });

  it("해가 바뀌어도 이어진다", () => {
    expect(monthOptions([new Date("2025-11-24")], new Date("2026-01-05T03:00:00Z"))).toEqual([
      "2026-01",
      "2025-12",
      "2025-11",
    ]);
  });
});

describe("weeksInMonth", () => {
  it("그 달에 속한 월요일을 오름차순으로 준다", () => {
    expect(weeksInMonth("2026-09").map(ymd)).toEqual(["2026-09-07", "2026-09-14", "2026-09-21", "2026-09-28"]);
  });

  it("1일이 월요일인 달은 1일부터 시작한다", () => {
    expect(weeksInMonth("2026-06").map(ymd)[0]).toBe("2026-06-01");
  });

  it("형식이 틀리면 빈 배열", () => {
    expect(weeksInMonth("2026-13")).toEqual([]);
    expect(weeksInMonth("nope")).toEqual([]);
  });
});

describe("formatMonthLabel", () => {
  it("YYYY-MM을 사람이 읽는 라벨로", () => {
    expect(formatMonthLabel("2026-09")).toBe("2026년 9월");
  });
});
