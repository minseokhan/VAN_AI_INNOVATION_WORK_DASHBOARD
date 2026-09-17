import { describe, expect, it } from "vitest";
import { parseWeekParam, weekOptions } from "./weekly";

const NOW = new Date("2026-09-17T03:00:00Z"); // KST 목 12:00 → 이번 주 월요일 2026-09-14

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

describe("weekOptions", () => {
  it("중복을 제거하고 최신순으로 정렬한다", () => {
    const opts = weekOptions([new Date("2026-08-31"), new Date("2026-09-07"), new Date("2026-08-31")], NOW);
    expect(opts.map((d) => d.toISOString().slice(0, 10))).toEqual(["2026-09-14", "2026-09-07", "2026-08-31"]);
  });

  it("보고가 없어도 이번 주는 항상 포함한다", () => {
    expect(weekOptions([], NOW).map((d) => d.toISOString().slice(0, 10))).toEqual(["2026-09-14"]);
  });

  it("이번 주 보고가 이미 있으면 중복 추가하지 않는다", () => {
    expect(weekOptions([new Date("2026-09-14")], NOW)).toHaveLength(1);
  });
});
