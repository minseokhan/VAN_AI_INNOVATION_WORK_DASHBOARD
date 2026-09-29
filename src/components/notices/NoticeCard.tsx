"use client";

import { ChevronDown } from "lucide-react";
import { useActionState, useState } from "react";
import { deleteNotice, updateNotice } from "@/app/(dashboard)/notices/actions";
import type { FormState } from "@/app/(dashboard)/projects/[id]/actions";
import { NoticeBody } from "@/components/notices/NoticeBody";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useFormDirty } from "@/components/ui/useFormDirty";
import { useRetainOnError } from "@/components/ui/useRetainOnError";
import { MAX_NOTICE } from "@/lib/notices/rules";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/date";

export type NoticeItem = {
  id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
};

export function NoticeCard({ notice, isAdmin, defaultOpen }: { notice: NoticeItem; isAdmin: boolean; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [state, formAction, pending] = useActionState<FormState, FormData>(async (prev, fd) => {
    const r = await updateNotice(notice.id, prev, fd);
    if (r.ok) setEditing(false);
    return r;
  }, {});
  const { formRef, submit } = useRetainOnError(formAction, state);
  const { noChange, check, guard } = useFormDirty(formRef, state);
  const e = state.fieldErrors ?? {};

  const edited = notice.updatedAt.getTime() - notice.createdAt.getTime() > 1000;

  if (editing) {
    return (
      <li className="rounded-md border border-slate-200 bg-white p-5">
        <form ref={formRef} action={guard(submit)} onInput={check} onChange={check} className="space-y-3">
          <Field id={`notice-title-${notice.id}`} label="제목" error={e.title}>
            <Input id={`notice-title-${notice.id}`} name="title" defaultValue={notice.title} maxLength={MAX_NOTICE.title} required />
          </Field>
          <Field id={`notice-content-${notice.id}`} label="내용" error={e.content}>
            <Textarea
              id={`notice-content-${notice.id}`}
              name="content"
              defaultValue={notice.content}
              rows={8}
              maxLength={MAX_NOTICE.content}
              required
            />
          </Field>
          {state.error && <p className="text-xs text-red-700">{state.error}</p>}
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "저장 중…" : "저장"}
            </Button>
            <Button variant="secondary" size="sm" disabled={pending} onClick={() => setEditing(false)}>
              취소
            </Button>
            {noChange && <span className="text-xs text-slate-500">변경된 내용이 없습니다</span>}
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="rounded-md border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{notice.title}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {notice.authorName} · {formatDate(notice.createdAt)}
            {edited && ` · ${formatDate(notice.updatedAt)} 수정`}
          </p>
        </div>
        <ChevronDown
          size={16}
          strokeWidth={2}
          aria-hidden
          className={cn("shrink-0 text-slate-400 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="border-t border-slate-200 px-5 py-4">
          <NoticeBody content={notice.content} />
          {isAdmin && (
            <div className="mt-4 flex items-center gap-2">
              <Button variant="text" size="sm" onClick={() => setEditing(true)}>
                수정
              </Button>
              <ConfirmDialog
                label="삭제"
                title="공지 삭제"
                message={`"${notice.title}"을(를) 삭제할까요? 되돌릴 수 없습니다.`}
                confirmLabel="삭제"
                size="sm"
                onConfirm={() => deleteNotice(notice.id).then((r) => setError(r.error ?? null))}
              />
              {error && <span className="text-xs text-red-700">{error}</span>}
            </div>
          )}
        </div>
      )}
    </li>
  );
}
