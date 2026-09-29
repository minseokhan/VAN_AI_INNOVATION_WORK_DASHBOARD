"use client";

import { Plus } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { createNotice } from "@/app/(dashboard)/notices/actions";
import type { FormState } from "@/app/(dashboard)/projects/[id]/actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useRetainOnError } from "@/components/ui/useRetainOnError";
import { MAX_NOTICE } from "@/lib/notices/rules";

export function NoticeForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(createNotice, {});
  const { formRef, submit } = useRetainOnError(formAction, state);
  const e = state.fieldErrors ?? {};

  // 등록에 성공하면 폼을 닫는다 (React 19 가 폼을 비운 뒤)
  useEffect(() => {
    if (state.ok) setOpen(false);
  }, [state]);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} strokeWidth={2} aria-hidden />
        공지 작성
      </Button>
    );
  }

  return (
    <form ref={formRef} action={submit} className="space-y-3 rounded-md border border-slate-200 bg-white p-5">
      <Field id="notice-title" label="제목" error={e.title}>
        <Input id="notice-title" name="title" maxLength={MAX_NOTICE.title} placeholder="예) 9월 정기 모임 안내" required />
      </Field>
      <Field id="notice-content" label="내용" error={e.content}>
        <Textarea
          id="notice-content"
          name="content"
          rows={8}
          maxLength={MAX_NOTICE.content}
          placeholder="일시·장소·준비물 등 부원이 알아야 할 내용을 적어 주세요"
          required
        />
      </Field>
      {state.error && <p className="text-xs text-red-700">{state.error}</p>}
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "등록 중…" : "등록"}
        </Button>
        <Button variant="secondary" disabled={pending} onClick={() => setOpen(false)}>
          취소
        </Button>
      </div>
    </form>
  );
}
