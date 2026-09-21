"use client";

import { useActionState } from "react";
import { createInquiry } from "@/app/(dashboard)/inquiries/actions";
import type { FormState } from "@/app/(dashboard)/projects/[id]/actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useRetainOnError } from "@/components/ui/useRetainOnError";
import { INQUIRY_KINDS, INQUIRY_KIND_LABEL, MAX_INQUIRY } from "@/lib/inquiries/rules";

const PLACEHOLDER = "예) 주간 보고 알림을 하루 앞당겨 주세요 / 배치 보드에서 드래그가 안 됩니다 / 이런 기능이 있으면 좋겠어요";

export function InquiryForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(createInquiry, {});
  const { formRef, submit } = useRetainOnError(formAction, state);
  const errors = state.fieldErrors ?? {};
  return (
    <form ref={formRef} action={submit} className="space-y-3 rounded-md border border-slate-200 p-4">
      <Field id="inq-kind" label="종류" error={errors.kind}>
        <Select id="inq-kind" name="kind" defaultValue="QUESTION" className="sm:max-w-xs" required>
          {INQUIRY_KINDS.map((k) => (
            <option key={k} value={k}>
              {INQUIRY_KIND_LABEL[k]}
            </option>
          ))}
        </Select>
      </Field>
      <Field id="inq-content" label="내용" error={errors.content}>
        <Textarea id="inq-content" name="content" rows={3} maxLength={MAX_INQUIRY} required placeholder={PLACEHOLDER} />
      </Field>
      {state.error && <p className="text-xs text-red-700">{state.error}</p>}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          남기기
        </Button>
        {state.ok && <span className="text-xs text-green-700">등록되었습니다</span>}
      </div>
    </form>
  );
}
