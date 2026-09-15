"use client";

import { Trash2 } from "lucide-react";
import { useOptimistic, useRef, useState, useTransition } from "react";
import { addFeature, deleteFeature, toggleFeature } from "@/app/(dashboard)/projects/[id]/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";

type Feature = { id: string; title: string; done: boolean };

export function FeatureChecklist({ projectId, features, canEdit }: { projectId: string; features: Feature[]; canEdit: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic(features, (state, patch: { id: string; done: boolean }) =>
    state.map((f) => (f.id === patch.id ? { ...f, done: patch.done } : f)),
  );
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [adding, startAdd] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const toggle = (id: string, done: boolean) =>
    startTransition(async () => {
      setOptimistic({ id, done });
      await toggleFeature(projectId, id, done);
    });

  const remove = (id: string) => startTransition(() => deleteFeature(projectId, id));

  const add = (fd: FormData) =>
    startAdd(async () => {
      const res = await addFeature(projectId, String(fd.get("title") ?? ""));
      setError(res.error ?? null);
      if (!res.error) formRef.current?.reset();
    });

  return (
    <div>
      {optimistic.length === 0 && <p className="py-2 text-sm text-slate-500">등록된 기능이 없습니다</p>}
      <ul>
        {optimistic.map((f) => (
          <li key={f.id} className="group flex items-center gap-3 border-b border-slate-100 py-2">
            <input
              id={`feature-${f.id}`}
              type="checkbox"
              checked={f.done}
              disabled={!canEdit}
              onChange={(e) => toggle(f.id, e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-navy-700"
            />
            <label htmlFor={`feature-${f.id}`} className={cn("flex-1 text-sm", f.done ? "text-slate-400 line-through" : "text-slate-700")}>
              {f.title}
            </label>
            {canEdit && (
              <button
                type="button"
                aria-label={`${f.title} 삭제`}
                onClick={() => remove(f.id)}
                className="text-slate-400 opacity-0 transition-colors hover:text-red-700 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500 group-hover:opacity-100"
              >
                <Trash2 size={16} strokeWidth={1.75} aria-hidden />
              </button>
            )}
          </li>
        ))}
      </ul>
      {canEdit && (
        <form ref={formRef} action={add} className="mt-3">
          <div className="flex gap-2">
            <Input name="title" aria-label="기능 추가" placeholder="기능 추가 후 Enter" maxLength={120} required disabled={adding} />
            <Button type="submit" variant="secondary" disabled={adding}>
              추가
            </Button>
          </div>
          {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
        </form>
      )}
    </div>
  );
}
