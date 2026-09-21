import { beforeEach, describe, expect, it, vi } from "vitest";

const { findMany } = vi.hoisted(() => ({ findMany: vi.fn() }));
vi.mock("@/lib/db", () => ({ db: { project: { findMany } } }));

import { listProjectsForBoard } from "./queries";

describe("listProjectsForBoard", () => {
  beforeEach(() => findMany.mockReset());

  it("members/features/최신 보고 1개를 함께 조회한다", async () => {
    findMany.mockResolvedValue([]);
    await listProjectsForBoard();
    expect(findMany).toHaveBeenCalledTimes(1);
    const arg = findMany.mock.calls[0][0];
    expect(arg.select.members.select.user.select).toEqual({ id: true, name: true });
    expect(arg.select.features.select).toEqual({ done: true });
    expect(arg.select.startedAt).toBe(true);
    expect(arg.select.weeklyUpdates).toMatchObject({ orderBy: { createdAt: "desc" }, take: 1 });
  });

  it("카드 데이터로 변환한다 (progress, members, lastReportAt)", async () => {
    const reported = new Date("2026-09-10T00:00:00Z");
    findMany.mockResolvedValue([
      {
        id: "p1", code: "1-1", title: "T", summary: "S", category: "C", priority: "上", status: "IN_PROGRESS", dueDate: null,
        members: [{ position: "FE", user: { id: "u1", name: "홍길동" } }],
        features: [{ done: true }, { done: false }],
        weeklyUpdates: [{ createdAt: reported }],
      },
      {
        id: "p2", code: "1-2", title: "T2", summary: "S2", category: "C", priority: "中", status: "UNASSIGNED", dueDate: null,
        members: [], features: [], weeklyUpdates: [],
      },
    ]);
    const rows = await listProjectsForBoard();
    expect(rows[0]).toMatchObject({ id: "p1", progress: 50, lastReportAt: reported, members: [{ id: "u1", name: "홍길동", position: "FE" }] });
    expect(rows[1]).toMatchObject({ id: "p2", progress: 0, lastReportAt: null, members: [] });
    expect(rows[0]).not.toHaveProperty("features");
  });
});
