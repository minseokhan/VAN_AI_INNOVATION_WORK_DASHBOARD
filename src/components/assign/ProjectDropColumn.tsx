"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Position, ProjectStatus } from "@prisma/client";
import { Crown, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { POSITION_LABEL, STATUS_LABEL, STATUS_TONE } from "@/lib/projects/labels";
import { cn } from "@/lib/utils/cn";

export type BoardProject = {
  id: string;
  code: string;
  title: string;
  status: ProjectStatus;
  members: { userId: string; name: string; position: Position; isLead: boolean }[];
};

export function ProjectDropColumn({
  project,
  error,
  onRemove,
  onPosition,
  onLead,
}: {
  project: BoardProject;
  error?: string;
  onRemove: (userId: string) => void;
  onPosition: (userId: string, position: Position) => void;
  onLead: (userId: string, isLead: boolean) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: project.id });
  const members = [...project.members].sort((a, b) => Number(b.isLead) - Number(a.isLead));
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-md border border-slate-200 bg-white px-4 pt-4 pb-3 transition-colors",
        isOver && "ring-2 ring-navy-500 bg-navy-50",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-slate-500">{project.code}</p>
          <h3 className="truncate text-sm font-semibold text-slate-900">{project.title}</h3>
        </div>
        <Badge tone={STATUS_TONE[project.status]}>{STATUS_LABEL[project.status]}</Badge>
      </div>
      {members.length === 0 ? (
        <p className="py-1 text-xs text-slate-400">여기로 드래그해서 배치</p>
      ) : (
        <ul className="space-y-1.5">
          {members.map((m) => (
            <li key={m.userId} className="flex items-center gap-2">
              <button
                type="button"
                title={m.isLead ? "팀장 해제" : "팀장으로 지정"}
                aria-label={`${m.name} ${m.isLead ? "팀장 해제" : "팀장으로 지정"}`}
                aria-pressed={m.isLead}
                onClick={() => onLead(m.userId, !m.isLead)}
                className="relative shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500"
              >
                <Avatar name={m.name} className={cn("transition-shadow", m.isLead && "ring-2 ring-navy-500 ring-offset-1")} />
                {m.isLead && (
                  <Crown
                    size={12}
                    strokeWidth={2.25}
                    aria-hidden
                    className="absolute -right-1 -top-1 rounded-full bg-white text-navy-700"
                  />
                )}
              </button>
              <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{m.name}</span>
              <Select
                aria-label={`${m.name} 포지션`}
                variant="underline"
                value={m.position}
                onChange={(e) => onPosition(m.userId, e.target.value as Position)}
              >
                {Object.entries(POSITION_LABEL).map(([v, label]) => (
                  <option key={v} value={v}>
                    {label}
                  </option>
                ))}
              </Select>
              <button
                type="button"
                aria-label={`${m.name} 배치 해제`}
                onClick={() => onRemove(m.userId)}
                className="text-slate-400 transition-colors hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500"
              >
                <X size={16} strokeWidth={1.75} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}
