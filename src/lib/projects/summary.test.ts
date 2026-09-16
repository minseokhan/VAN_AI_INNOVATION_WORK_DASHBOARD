import { describe, expect, it } from "vitest";
import { summarize } from "./summary";

describe("summarize", () => {
  it("빈 목록", () => {
    expect(summarize([])).toEqual({ total: 0, unassigned: 0, inProgress: 0, done: 0 });
  });
  it("상태별 개수", () => {
    const projects = [
      { status: "UNASSIGNED" as const },
      { status: "UNASSIGNED" as const },
      { status: "IN_PROGRESS" as const },
      { status: "DONE" as const },
    ];
    expect(summarize(projects)).toEqual({ total: 4, unassigned: 2, inProgress: 1, done: 1 });
  });
});
