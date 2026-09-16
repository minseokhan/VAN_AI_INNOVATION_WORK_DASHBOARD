import type { ProjectStatus } from "@prisma/client";

export function summarize(projects: Array<{ status: ProjectStatus }>) {
  const count = (s: ProjectStatus) => projects.filter((p) => p.status === s).length;
  return { total: projects.length, unassigned: count("UNASSIGNED"), inProgress: count("IN_PROGRESS"), done: count("DONE") };
}
