import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { parseWeekParam, weekOptions } from "@/lib/reports/weekly";
import { formatWeekLabel } from "@/lib/utils/week";
import { ReportToolbar } from "@/components/reports/ReportToolbar";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";

const ymd = (d: Date) => d.toISOString().slice(0, 10);

function Entry({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-600">{label}</dt>
      <dd className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{text}</dd>
    </div>
  );
}

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") redirect("/");
    throw e; // requireUser의 NEXT_REDIRECT 등은 그대로 전파
  }
  const week = parseWeekParam((await searchParams).week);

  const [projects, updates, weeks] = await Promise.all([
    db.project.findMany({
      where: { members: { some: {} } },
      orderBy: { code: "asc" },
      select: { id: true, code: true, title: true },
    }),
    db.weeklyUpdate.findMany({
      where: { weekStart: week },
      select: { id: true, projectId: true, didThisWeek: true, planNextWeek: true, issues: true, author: { select: { name: true } } },
    }),
    db.weeklyUpdate.findMany({ distinct: ["weekStart"], select: { weekStart: true } }),
  ]);

  const byProject = new Map(updates.map((u) => [u.projectId, u]));
  const options = weekOptions(weeks.map((w) => w.weekStart)).map(ymd);

  return (
    <>
      <PageHeader title="주간 보고" />
      <ReportToolbar weeks={options} selected={ymd(week)} />

      <div className="mb-4 flex items-baseline gap-3">
        <h2 className="text-lg font-semibold text-slate-900">{formatWeekLabel(week)}</h2>
        <p className="text-sm text-slate-500">
          제출 {byProject.size} / {projects.length}
        </p>
      </div>

      <ol className="space-y-3">
        {projects.map((p) => {
          const u = byProject.get(p.id);
          return (
            <li key={p.id} className="rounded-md border border-slate-200 p-4 print:break-inside-avoid">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Link href={`/projects/${p.id}`} className="text-sm font-medium text-slate-900 hover:underline">
                  <span className="tabular-nums text-slate-500">{p.code}</span> {p.title}
                </Link>
                {u ? <span className="text-xs text-slate-500">· {u.author.name}</span> : <Badge tone="amber">미제출</Badge>}
              </div>
              {u && (
                <dl className="space-y-2">
                  <Entry label="이번 주 한 일" text={u.didThisWeek} />
                  <Entry label="다음 주 계획" text={u.planNextWeek} />
                  {u.issues && <Entry label="이슈 · 막힌 점" text={u.issues} />}
                </dl>
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}
