import type { ProjectStatus } from "@prisma/client";
import { priorityRank } from "./labels";

export type ProjectFilter = { status?: ProjectStatus | "ALL"; category?: string | "ALL"; q?: string };

export function filterProjects<T extends { status: ProjectStatus; category: string; title: string; code: string; summary: string }>(
  projects: T[],
  f: ProjectFilter,
): T[] {
  const q = f.q?.trim().toLowerCase() ?? "";
  return projects.filter(
    (p) =>
      (!f.status || f.status === "ALL" || p.status === f.status) &&
      (!f.category || f.category === "ALL" || p.category === f.category) &&
      (q === "" || [p.title, p.code, p.summary].some((s) => s.toLowerCase().includes(q))),
  );
}

const STATUS_ORDER: Record<ProjectStatus, number> = { IN_PROGRESS: 0, UNASSIGNED: 1, DONE: 2 };

/** 진행중 → 미배정 → 완료, 같은 상태는 priorityRank 오름차순, 그다음 code 자연 정렬 */
export function sortProjects<T extends { status: ProjectStatus; priority: string; code: string }>(projects: T[]): T[] {
  return [...projects].sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
      priorityRank(a.priority) - priorityRank(b.priority) ||
      a.code.localeCompare(b.code, undefined, { numeric: true }),
  );
}
