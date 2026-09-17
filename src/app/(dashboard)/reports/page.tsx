import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { buildSections } from "@/lib/reports/sections";
import { monthOptions, parseWeekParam } from "@/lib/reports/weekly";
import { formatDateTime } from "@/lib/utils/date";
import { formatWeekLabel } from "@/lib/utils/week";
import { ReminderButton } from "@/components/reports/ReminderButton";
import { ReportCard } from "@/components/reports/ReportCard";
import { ReportNoteForm } from "@/components/reports/ReportNoteForm";
import { ReportToolbar } from "@/components/reports/ReportToolbar";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

const ymd = (d: Date) => d.toISOString().slice(0, 10);

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") redirect("/");
    throw e; // requireUser의 NEXT_REDIRECT 등은 그대로 전파
  }
  const week = parseWeekParam((await searchParams).week);

  const [projects, updates, allWeeks, note] = await Promise.all([
    db.project.findMany({
      orderBy: { code: "asc" },
      select: { id: true, code: true, title: true, status: true, members: { select: { user: { select: { name: true } } } } },
    }),
    db.weeklyUpdate.findMany({
      where: { weekStart: week },
      select: {
        projectId: true,
        didThisWeek: true,
        planNextWeek: true,
        issues: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { name: true } },
      },
    }),
    db.weeklyUpdate.findMany({ distinct: ["weekStart"], select: { weekStart: true } }),
    db.reportNote.findUnique({ where: { weekStart: week }, select: { content: true, updatedAt: true, author: { select: { name: true } } } }),
  ]);

  const byProject = new Map(updates.map((u) => [u.projectId, u]));
  const sections = buildSections(projects, new Set(byProject.keys()));
  const months = monthOptions(allWeeks.map((w) => w.weekStart));

  // 독촉 대상: 진행 중인데 그 주 보고가 없고, 부를 멤버가 있는 팀
  const preview = sections[0].rows
    .filter((r) => !r.submitted && r.project.members.length > 0)
    .map((r) => `@${r.project.members.map((m) => m.user.name).join(" @")} 님 [${r.project.code}] ${r.project.title}`);

  return (
    <>
      <PageHeader title="주간 보고" />
      <ReportToolbar months={months} week={ymd(week)} />

      <h2 className="mb-4 text-lg font-semibold text-slate-900">{formatWeekLabel(week)}</h2>

      <ReportNoteForm
        week={ymd(week)}
        initial={note?.content ?? ""}
        meta={note ? `${note.author.name} · ${formatDateTime(note.updatedAt)}` : null}
      />
      <ReminderButton week={ymd(week)} preview={preview} />

      <div className="space-y-8">
        {sections.map((s) => (
          <section key={s.key}>
            <div className="mb-3 flex items-baseline gap-2 border-b border-slate-200 pb-2">
              <h3 className="text-sm font-semibold text-slate-900">{s.label}</h3>
              <span className="text-xs text-slate-500">
                {s.key === "UNASSIGNED" ? `${s.total}개` : `제출 ${s.submitted} / ${s.total}`}
              </span>
            </div>
            {s.rows.length === 0 ? (
              <EmptyState message="해당 프로젝트가 없습니다" />
            ) : (
              <ul className="space-y-2">
                {s.rows.map(({ project, submitted }) => (
                  <ReportCard
                    key={project.id}
                    project={project}
                    update={
                      submitted
                        ? { ...byProject.get(project.id)!, authorName: byProject.get(project.id)!.author.name }
                        : null
                    }
                    showMissingBadge={s.key !== "UNASSIGNED"}
                  />
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
