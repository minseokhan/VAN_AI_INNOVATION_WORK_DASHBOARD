"use client";

import { Plus } from "lucide-react";
import { useActionState, useState } from "react";
import { createMinute, deleteMinute } from "@/app/(dashboard)/minutes/actions";
import type { FormState } from "@/app/(dashboard)/projects/[id]/actions";
import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { Field } from "@/components/ui/Field";
import { FileInput } from "@/components/ui/FileInput";
import { Input } from "@/components/ui/Input";
import { useRetainOnError } from "@/components/ui/useRetainOnError";
import { MAX_MINUTE_TITLE } from "@/lib/minutes/rules";
import { ALLOWED_EXT, validateUploadFile } from "@/lib/plan-docs/validation";

const ACCEPT = ALLOWED_EXT.map((e) => `.${e}`).join(",");

/** 파일을 먼저 올리고, 받은 주소로 회의록을 등록한다 */
export function MinuteForm({ today }: { today: string }) {
  const [open, setOpen] = useState(false);

  const [state, formAction, pending] = useActionState<FormState, FormData>(async (prev, fd) => {
    const file = fd.get("file");
    if (!(file instanceof File) || !file.name) return { fieldErrors: { file: "회의록 파일을 첨부하세요" } };
    const err = validateUploadFile(file.name, file.size);
    if (err) return { fieldErrors: { file: err } };
    const body = new FormData();
    body.set("file", file);
    body.set("kind", "minutes");
    const res = await fetch("/api/upload", { method: "POST", body });
    const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!res.ok || !json.url) return { fieldErrors: { file: json.error ?? "파일 업로드에 실패했습니다" } };
    fd.set("fileUrl", json.url);
    const r = await createMinute(prev, fd);
    if (r.ok) setOpen(false);
    return r;
  }, {});
  const { formRef, submit } = useRetainOnError(formAction, state);
  const e = state.fieldErrors ?? {};

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} strokeWidth={2} aria-hidden />
        회의록 등록
      </Button>
    );
  }

  return (
    <form ref={formRef} action={submit} className="space-y-4 rounded-md border border-slate-200 bg-white p-5">
      <div className="grid gap-4 sm:grid-cols-[11rem_1fr]">
        <Field id="mn-date" label="회의 날짜" error={e.date}>
          <Input id="mn-date" name="date" type="date" defaultValue={today} required />
        </Field>
        <Field id="mn-title" label="제목" error={e.title}>
          <Input id="mn-title" name="title" maxLength={MAX_MINUTE_TITLE} placeholder="예) 10월 1주차 정기 회의" required />
        </Field>
      </div>
      <Field id="mn-file" label="회의록 파일 (20MB 이하)" error={e.file}>
        <FileInput id="mn-file" name="file" accept={ACCEPT} required />
      </Field>
      {state.error && <p className="text-xs text-red-700">{state.error}</p>}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "등록 중…" : "등록"}
        </Button>
        <Button variant="secondary" disabled={pending} onClick={() => setOpen(false)}>
          닫기
        </Button>
      </div>
    </form>
  );
}

export function DeleteMinuteButton({ id, title }: { id: string; title: string }) {
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <ConfirmButton
        label="삭제"
        confirmLabel="삭제"
        message={`"${title}" 회의록을 삭제할까요?`}
        size="sm"
        onConfirm={() => deleteMinute(id).then((r) => setError(r.error ?? null))}
      />
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}
