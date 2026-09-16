import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { canDeleteQuestion, filterQuestions, type QuestionFilter } from "@/lib/questions/rules";
import { cn } from "@/lib/utils/cn";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { QuestionForm } from "@/components/questions/QuestionForm";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

const SCOPES: { key: QuestionFilter["scope"]; label: string }[] = [
  { key: "ALL", label: "전체" },
  { key: "MINE", label: "내 프로젝트" },
  { key: "UNANSWERED", label: "미답변" },
];

export default async function QuestionsPage({ searchParams }: { searchParams: Promise<{ scope?: string; project?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const scope = SCOPES.some((s) => s.key === sp.scope) ? (sp.scope as QuestionFilter["scope"]) : "ALL";
  const project = sp.project || undefined;
  const isAdmin = user.role === "ADMIN";

  const [questions, projects] = await Promise.all([
    db.question.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true } },
        answeredBy: { select: { name: true } },
        project: { select: { code: true, title: true, members: { select: { userId: true } } } },
      },
    }),
    db.project.findMany({
      where: isAdmin ? undefined : { members: { some: { userId: user.id } } },
      orderBy: { code: "asc" },
      select: { id: true, code: true, title: true },
    }),
  ]);

  const all = questions.map((q) => ({ ...q, project: { ...q.project, memberIds: q.project.members.map((m) => m.userId) } }));
  const visible = filterQuestions(all, { scope, project }, user.id);
  const unanswered = filterQuestions(all, { scope: "UNANSWERED", project }, user.id).length;
  const href = (s: QuestionFilter["scope"], p = project) => {
    const qs = new URLSearchParams();
    if (s !== "ALL") qs.set("scope", s);
    if (p) qs.set("project", p);
    const str = qs.toString();
    return str ? `/questions?${str}` : "/questions";
  };

  return (
    <>
      <PageHeader title="질문" />
      <div className="space-y-6">
        {projects.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
            배치된 프로젝트가 없어 질문을 남길 수 없습니다
          </p>
        ) : (
          <QuestionForm projects={projects} defaultProjectId={project} />
        )}

        <div className="flex flex-wrap items-center gap-3">
          <div role="group" aria-label="범위" className="inline-flex rounded-md border border-slate-300">
            {SCOPES.map((s) => (
              <Link
                key={s.key}
                href={href(s.key)}
                aria-current={scope === s.key ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors first:rounded-l-md last:rounded-r-md",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500",
                  scope === s.key ? "bg-navy-100 font-medium text-navy-700" : "text-slate-600 hover:bg-slate-50",
                )}
              >
                {s.label}
                {s.key === "UNANSWERED" && unanswered > 0 && <Badge tone="amber">{unanswered}</Badge>}
              </Link>
            ))}
          </div>
          {project && (
            <Link href={href(scope, undefined)} className="text-xs text-navy-500 hover:underline">
              프로젝트 필터 해제
            </Link>
          )}
        </div>

        {visible.length === 0 ? (
          <EmptyState message="표시할 질문이 없습니다" />
        ) : (
          <ul className="space-y-3">
            {visible.map((q) => (
              <QuestionCard
                key={q.id}
                isAdmin={isAdmin}
                canDelete={canDeleteQuestion(user, q)}
                q={{
                  id: q.id,
                  projectId: q.projectId,
                  projectCode: q.project.code,
                  projectTitle: q.project.title,
                  authorName: q.author.name,
                  content: q.content,
                  createdAt: q.createdAt,
                  answer: q.answer,
                  answererName: q.answeredBy?.name ?? null,
                  answeredAt: q.answeredAt,
                  sentToDiscordAt: q.sentToDiscordAt,
                }}
              />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
