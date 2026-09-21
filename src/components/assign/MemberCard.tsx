"use client";

import { useDraggable } from "@dnd-kit/core";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils/cn";

export type BoardMember = { id: string; name: string; codes: string[] };

/** 카드 본체 — DragOverlay 복제본에도 사용 */
export function MemberCardView({ member, className }: { member: BoardMember; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2", className)}>
      <Avatar name={member.name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">{member.name}</p>
        <p className="text-xs text-slate-500">{member.codes.length}개 참여</p>
      </div>
      {member.codes.length > 0 && (
        // 많이 배치된 멤버 카드만 길어져 목록이 들쭉날쭉해지지 않도록 3개까지만
        <div className="flex max-w-[5.5rem] flex-wrap justify-end gap-x-1 text-[11px] leading-tight tabular-nums text-slate-500">
          {member.codes.slice(0, 3).map((c) => (
            <span key={c}>{c}</span>
          ))}
          {member.codes.length > 3 && <span>+{member.codes.length - 3}</span>}
        </div>
      )}
    </div>
  );
}

export function MemberCard({ member }: { member: BoardMember }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: member.id, data: { member } });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      aria-label={`${member.name} 드래그해서 배치`}
      className="cursor-grab touch-none rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500"
    >
      <MemberCardView member={member} className={cn("hover:border-navy-500 transition-colors", isDragging && "opacity-40")} />
    </div>
  );
}
