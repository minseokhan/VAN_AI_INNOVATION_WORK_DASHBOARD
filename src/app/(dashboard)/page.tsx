import type { ProjectStatus } from "@prisma/client";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth/guards";
import { filterProjects, sortProjects } from "@/lib/projects/filter";
import { listProjectsForBoard } from "@/lib/projects/queries";
import { summarize } from "@/lib/projects/summary";
import { FilterBar } from "@/components/projects/FilterBar";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

type Search = { status?: string; category?: string; q?: string };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireUser();
  const { status, category, q } = await searchParams;
  const all = await listProjectsForBoard();
  const s = summarize(all);
  const categories = [...new Set(all.map((p) => p.category))].sort();
  const projects = sortProjects(filterProjects(all, { status: status as ProjectStatus | "ALL" | undefined, category, q }));

  const stats = [
    ["전체", s.total],
    ["미배정", s.unassigned],
    ["진행중", s.inProgress],
    ["완료", s.done],
  ] as const;

  return (
    <>
      <PageHeader title="프로젝트" />
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(([label, n]) => (
          <div key={label} className="rounded-md border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-2xl font-semibold tabular-nums text-slate-900">{n}</p>
          </div>
        ))}
      </div>
      <Suspense>
        <FilterBar categories={categories} />
      </Suspense>
      {projects.length === 0 ? (
        <EmptyState message="조건에 맞는 프로젝트가 없습니다" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </>
  );
}
