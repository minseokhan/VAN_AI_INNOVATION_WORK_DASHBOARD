"use client";

import { Plus } from "lucide-react";
import { useActionState, useState } from "react";
import { addExpense } from "@/app/(dashboard)/expenses/actions";
import type { FormState } from "@/app/(dashboard)/projects/[id]/actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { FileInput } from "@/components/ui/FileInput";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useRetainOnError } from "@/components/ui/useRetainOnError";
import { EXPENSE_KINDS, EXPENSE_KIND_LABEL, MAX_EXPENSE_NOTE, MAX_EXPENSE_TITLE } from "@/lib/expenses/rules";
import { ALLOWED_EXT, validateUploadFile } from "@/lib/plan-docs/validation";

const ACCEPT = ALLOWED_EXT.map((e) => `.${e}`).join(",");

/** 한 번에 한 항목씩 등록한다. 등록하면 폼이 비워지므로 바로 다음 항목을 이어서 넣을 수 있다 */
export function ExpenseForm({ defaultMonth }: { defaultMonth: string }) {
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState(0);

  const [state, formAction, pending] = useActionState<FormState, FormData>(async (prev, fd) => {
    const file = fd.get("receipt");
    if (file instanceof File && file.name) {
      const err = validateUploadFile(file.name, file.size);
      if (err) return { fieldErrors: { receipt: err } };
      const body = new FormData();
      body.set("file", file);
      body.set("kind", "receipt");
      const res = await fetch("/api/upload", { method: "POST", body });
      const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (res.status === 503) {
        return { fieldErrors: { receipt: "파일 저장소가 설정되지 않아 영수증을 올릴 수 없습니다. 금액과 내용만 먼저 등록해 주세요." } };
      }
      if (!res.ok || !json.url) return { fieldErrors: { receipt: json.error ?? "영수증 업로드에 실패했습니다" } };
      fd.set("receiptUrl", json.url);
    }
    const r = await addExpense(prev, fd);
    if (r.ok) setAdded((n) => n + 1);
    return r;
  }, {});
  const { formRef, submit } = useRetainOnError(formAction, state);
  const e = state.fieldErrors ?? {};

  if (!open) {
    return (
      <div className="no-print flex items-center gap-3">
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} strokeWidth={2} aria-hidden />
          비용 청구 추가
        </Button>
        {added > 0 && <span className="text-xs text-green-700">{added}건 등록되었습니다</span>}
      </div>
    );
  }

  return (
    <form ref={formRef} action={submit} className="no-print space-y-4 rounded-md border border-slate-200 bg-white p-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="ex-kind" label="구분" error={e.kind}>
          <Select id="ex-kind" name="kind" defaultValue="SPENT">
            {EXPENSE_KINDS.map((k) => (
              <option key={k} value={k}>
                {EXPENSE_KIND_LABEL[k]}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="ex-month" label="청구 월" error={e.month}>
          <Input id="ex-month" name="month" type="month" defaultValue={defaultMonth} required />
        </Field>
        <Field id="ex-amount" label="금액 (원)" error={e.amount}>
          <Input id="ex-amount" name="amount" inputMode="numeric" placeholder="30000" required />
        </Field>
      </div>
      <Field id="ex-title" label="항목명" error={e.title}>
        <Input id="ex-title" name="title" maxLength={MAX_EXPENSE_TITLE} placeholder="예) OpenAI API 크레딧, 서버 호스팅, 회의 간식" required />
      </Field>
      <Field id="ex-note" label="청구 내용 (무엇에, 왜 썼는지)" error={e.note}>
        <Textarea id="ex-note" name="note" rows={3} maxLength={MAX_EXPENSE_NOTE} placeholder="예) 9월 챗봇 프로젝트 임베딩 테스트에 사용. 결제일 9/12, 카드 개인 선결제" />
      </Field>
      <Field id="ex-receipt" label="영수증 파일 첨부 (선택 · 20MB 이하)" error={e.receipt}>
        <FileInput id="ex-receipt" name="receipt" accept={ACCEPT} />
      </Field>
      {state.error && <p className="text-xs text-red-700">{state.error}</p>}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "등록 중…" : "등록"}
        </Button>
        <Button variant="secondary" disabled={pending} onClick={() => setOpen(false)}>
          닫기
        </Button>
        {added > 0 && <span className="text-xs text-green-700">{added}건 등록됨 · 계속 추가할 수 있습니다</span>}
      </div>
    </form>
  );
}
