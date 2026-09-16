import { CalendarClock } from "lucide-react";
import { AvatarGroup } from "@/components/ui/AvatarGroup";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/projects/labels";
import type { ProjectCardData } from "@/lib/projects/queries";
import { cn } from "@/lib/utils/cn";
import { formatDate, relativeDays } from "@/lib/utils/date";

export function ProjectCard({ project: p }: { project: ProjectCardData }) {
  const overdue = p.dueDate !== null && p.status !== "DONE" && formatDate(p.dueDate) < formatDate(new Date());
  return (
    <Card href={`/projects/${p.id}`} className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Badge tone={STATUS_TONE[p.status]}>{STATUS_LABEL[p.status]}</Badge>
          <Badge>{p.priority}</Badge>
        </div>
        <span className="text-xs text-slate-500">{p.lastReportAt ? `보고 ${relativeDays(p.lastReportAt)}` : "보고 없음"}</span>
      </div>
      <div>
        <p className="text-xs text-slate-500">{p.code}</p>
        <h3 className="text-base font-semibold text-slate-900">{p.title}</h3>
      </div>
      <p className="line-clamp-2 text-sm text-slate-500">{p.summary}</p>
      <ProgressBar value={p.progress} className="mt-auto" />
      <div className="flex items-center justify-between gap-2">
        {p.members.length > 0 ? (
          <AvatarGroup names={p.members.map((m) => m.name)} />
        ) : (
          <span className="text-xs text-slate-400">미배정</span>
        )}
        {p.dueDate && (
          <span className={cn("inline-flex items-center gap-1 text-xs tabular-nums", overdue ? "text-red-700" : "text-slate-500")}>
            <CalendarClock size={16} strokeWidth={1.75} aria-hidden />
            {formatDate(p.dueDate)}
          </span>
        )}
      </div>
    </Card>
  );
}
