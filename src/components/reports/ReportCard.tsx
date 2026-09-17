import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils/date";

export type ReportCardUpdate = {
  authorName: string;
  didThisWeek: string;
  planNextWeek: string;
  issues: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ReportCardProject = { id: string; code: string; title: string };

/** 세 항목이 눈으로 구분되도록 좌측 색 띠 + 라벨을 붙인다 */
const BLOCK = {
  did: "border-navy-500 bg-navy-50",
  plan: "border-slate-300 bg-slate-50",
  issues: "border-amber-400 bg-amber-50",
} as const;

function Block({ tone, label, text }: { tone: keyof typeof BLOCK; label: string; text: string }) {
  return (
    <div className={`border-l-2 py-2 pl-3 pr-2 ${BLOCK[tone]}`}>
      <p className="mb-1 text-xs font-semibold text-slate-600">{label}</p>
      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800">{text}</p>
    </div>
  );
}

function Title({ project }: { project: ReportCardProject }) {
  return (
    <Link href={`/projects/${project.id}`} className="min-w-0 truncate text-sm font-medium text-slate-900 hover:underline">
      <span className="tabular-nums text-slate-500">{project.code}</span> {project.title}
    </Link>
  );
}

/** 제출된 보고는 접힌 카드(클릭해서 펼침), 미제출은 한 줄. 인쇄 시에는 툴바가 전부 펼친다 */
export function ReportCard({
  project,
  update,
  showMissingBadge = true,
}: {
  project: ReportCardProject;
  update: ReportCardUpdate | null;
  showMissingBadge?: boolean;
}) {
  if (!update) {
    return (
      <li className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 px-4 py-3">
        <Title project={project} />
        {showMissingBadge && <Badge tone="amber">미제출</Badge>}
      </li>
    );
  }

  const edited = update.updatedAt.getTime() - update.createdAt.getTime() > 60_000;

  return (
    <li>
      <details className="group rounded-md border border-slate-200 open:border-slate-300 print:break-inside-avoid">
        <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2 px-4 py-3 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500">
          <ChevronRight
            size={16}
            strokeWidth={1.75}
            aria-hidden
            className="shrink-0 text-slate-400 transition-transform group-open:rotate-90 print:hidden"
          />
          <Title project={project} />
          <Badge tone="green">제출함</Badge>
          <span className="ml-auto whitespace-nowrap text-xs text-slate-500">
            {update.authorName} · {formatDateTime(update.updatedAt)}
            {edited && " (수정됨)"}
          </span>
        </summary>
        <div className="space-y-2 border-t border-slate-100 px-4 py-3">
          <Block tone="did" label="이번 주 한 일" text={update.didThisWeek} />
          <Block tone="plan" label="다음 주 계획" text={update.planNextWeek} />
          {update.issues && <Block tone="issues" label="이슈 · 막힌 점" text={update.issues} />}
        </div>
      </details>
    </li>
  );
}
