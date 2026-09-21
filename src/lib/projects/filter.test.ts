import { describe, expect, it } from "vitest";
import { filterProjects, sortProjects } from "./filter";

const p = (over: Partial<{ status: "UNASSIGNED" | "IN_PROGRESS" | "DONE"; category: string; title: string; code: string; summary: string; priority: string }>) => ({
  status: "UNASSIGNED" as const,
  category: "교육",
  title: "제목",
  code: "1-1",
  summary: "요약",
  priority: "中",
  ...over,
});

describe("filterProjects", () => {
  const list = [
    p({ code: "1-1", status: "UNASSIGNED", category: "교육", title: "챗봇 만들기", summary: "학회용 봇" }),
    p({ code: "2-1", status: "IN_PROGRESS", category: "운영", title: "출석 관리", summary: "QR 체크인" }),
    p({ code: "3-1", status: "DONE", category: "교육", title: "Slide Bot", summary: "발표 자료" }),
  ];
  it("필터 없음/ALL이면 전부", () => {
    expect(filterProjects(list, {})).toEqual(list);
    expect(filterProjects(list, { status: "ALL", category: "ALL", q: "" })).toEqual(list);
  });
  it("status 필터", () => {
    expect(filterProjects(list, { status: "DONE" }).map((x) => x.code)).toEqual(["3-1"]);
  });
  it("category 필터", () => {
    expect(filterProjects(list, { category: "교육" }).map((x) => x.code)).toEqual(["1-1", "3-1"]);
  });
  it("q는 title/code/summary 대소문자 무시 부분일치", () => {
    expect(filterProjects(list, { q: "slide" }).map((x) => x.code)).toEqual(["3-1"]);
    expect(filterProjects(list, { q: "2-1" }).map((x) => x.code)).toEqual(["2-1"]);
    expect(filterProjects(list, { q: "qr" }).map((x) => x.code)).toEqual(["2-1"]);
    expect(filterProjects(list, { q: "  봇 " }).map((x) => x.code)).toEqual(["1-1"]);
    expect(filterProjects(list, { q: "없음" })).toEqual([]);
  });
  it("조건은 AND", () => {
    expect(filterProjects(list, { status: "UNASSIGNED", category: "운영" })).toEqual([]);
  });
});

describe("sortProjects", () => {
  it("진행중 → 미배정 → 완료", () => {
    const list = [p({ code: "1", status: "DONE" }), p({ code: "2", status: "UNASSIGNED" }), p({ code: "3", status: "IN_PROGRESS" })];
    expect(sortProjects(list).map((x) => x.code)).toEqual(["3", "2", "1"]);
  });
  it("같은 상태에서는 priorityRank 오름차순", () => {
    const list = [p({ code: "1", priority: "下" }), p({ code: "2", priority: "上" }), p({ code: "3", priority: "中" })];
    expect(sortProjects(list).map((x) => x.code)).toEqual(["2", "3", "1"]);
  });
  it("같은 우선순위에서는 code 자연 정렬", () => {
    const list = [p({ code: "2-10" }), p({ code: "2-2" }), p({ code: "2-1" }), p({ code: "10-1" })];
    expect(sortProjects(list).map((x) => x.code)).toEqual(["2-1", "2-2", "2-10", "10-1"]);
  });
  it("원본 배열을 변경하지 않는다", () => {
    const list = [p({ code: "2" }), p({ code: "1" })];
    sortProjects(list);
    expect(list.map((x) => x.code)).toEqual(["2", "1"]);
  });
});
