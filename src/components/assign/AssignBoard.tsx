"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { Position } from "@prisma/client";
import { useOptimistic, useState, useTransition } from "react";
import { assignMember, setLead, setPosition, unassignMember } from "@/app/(dashboard)/assign/actions";
import { Input } from "@/components/ui/Input";
import { MemberCard, MemberCardView, type BoardMember } from "./MemberCard";
import { ProjectDropColumn, type BoardProject } from "./ProjectDropColumn";

type Patch =
  | { type: "add"; projectId: string; member: BoardMember }
  | { type: "remove"; projectId: string; userId: string }
  | { type: "position"; projectId: string; userId: string; position: Position }
  | { type: "lead"; projectId: string; userId: string; isLead: boolean };

function apply(projects: BoardProject[], patch: Patch): BoardProject[] {
  return projects.map((p) => {
    if (p.id !== patch.projectId) return p;
    switch (patch.type) {
      case "add":
        if (p.members.some((m) => m.userId === patch.member.id)) return p;
        return {
          ...p,
          members: [...p.members, { userId: patch.member.id, name: patch.member.name, position: "ETC", isLead: false }],
        };
      case "remove":
        return { ...p, members: p.members.filter((m) => m.userId !== patch.userId) };
      case "position":
        return { ...p, members: p.members.map((m) => (m.userId === patch.userId ? { ...m, position: patch.position } : m)) };
      // 팀장은 프로젝트당 한 명 — 나머지는 전부 내린다
      case "lead":
        return { ...p, members: p.members.map((m) => ({ ...m, isLead: patch.isLead && m.userId === patch.userId })) };
    }
  });
}

export function AssignBoard({ members, projects }: { members: BoardMember[]; projects: BoardProject[] }) {
  const [optimistic, patch] = useOptimistic(projects, apply);
  const [, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [active, setActive] = useState<BoardMember | null>(null);
  const [q, setQ] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  // 낙관적 반영 → 서버 액션 → 에러면 컬럼 하단에 표시(낙관 상태는 트랜지션 종료 시 서버 값으로 롤백)
  const run = (p: Patch, action: () => Promise<{ error?: string }>) =>
    startTransition(async () => {
      patch(p);
      const res = await action();
      setErrors((e) => ({ ...e, [p.projectId]: res.error ?? "" }));
    });

  const onDragStart = (e: DragStartEvent) => setActive((e.active.data.current?.member as BoardMember) ?? null);
  const onDragEnd = (e: DragEndEvent) => {
    setActive(null);
    const member = e.active.data.current?.member as BoardMember | undefined;
    if (!e.over || !member) return;
    const projectId = String(e.over.id);
    run({ type: "add", projectId, member }, () => assignMember(projectId, member.id));
  };

  const visible = members.filter((m) => m.name.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActive(null)}>
      <div className="flex gap-6">
        <aside className="sticky top-0 w-64 shrink-0 self-start">
          <Input aria-label="멤버 검색" placeholder="멤버 검색" value={q} onChange={(e) => setQ(e.target.value)} className="mb-3" />
          <div className="max-h-[calc(100vh-8rem)] space-y-2 overflow-y-auto">
            {visible.length === 0 && <p className="text-xs text-slate-400">멤버가 없습니다</p>}
            {visible.map((m) => (
              <MemberCard key={m.id} member={m} />
            ))}
          </div>
        </aside>
        <div className="grid min-w-0 flex-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
          {optimistic.map((p) => (
            <ProjectDropColumn
              key={p.id}
              project={p}
              error={errors[p.id] || undefined}
              onRemove={(userId) => run({ type: "remove", projectId: p.id, userId }, () => unassignMember(p.id, userId))}
              onPosition={(userId, position) =>
                run({ type: "position", projectId: p.id, userId, position }, () => setPosition(p.id, userId, position))
              }
              onLead={(userId, isLead) => run({ type: "lead", projectId: p.id, userId, isLead }, () => setLead(p.id, userId, isLead))}
            />
          ))}
        </div>
      </div>
      <DragOverlay dropAnimation={{ duration: 200 }}>{active && <MemberCardView member={active} />}</DragOverlay>
    </DndContext>
  );
}
