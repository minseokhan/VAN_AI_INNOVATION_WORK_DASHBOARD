"use client";

import { useActionState, useState } from "react";
import { submitWeeklyUpdate, type FormState } from "@/app/(dashboard)/projects/[id]/actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Textarea";
import type { WeeklyInput } from "@/lib/projects/info";

export function WeeklyUpdateForm({
  projectId,
  weekLabel,
  current,
}: {
  projectId: string;
  weekLabel: string;
  current: WeeklyInput | null;
}) {
  const [saved, setSaved] = useState(false);
  const [state, formAction, pending] = useActionState<FormState<keyof WeeklyInput>, FormData>(
    async (prev, fd) => {
      const r = await submitWeeklyUpdate(projectId, prev, fd);
      setSaved(!r.error && !r.fieldErrors);
      return r;
    },
    {},
  );
  const errors = state.fieldErrors ?? {};
  return (
    <form action={formAction} className="space-y-3 rounded-md border border-slate-200 p-4">
      <p className="text-xs font-medium text-slate-500">{weekLabel}</p>
      <Field id="didThisWeek" label="이번 주 한 일" error={errors.didThisWeek}>
        <Textarea id="didThisWeek" name="didThisWeek" defaultValue={current?.didThisWeek} rows={3} maxLength={2000} required />
      </Field>
      <Field id="planNextWeek" label="다음 주 계획" error={errors.planNextWeek}>
        <Textarea id="planNextWeek" name="planNextWeek" defaultValue={current?.planNextWeek} rows={3} maxLength={2000} required />
      </Field>
      <Field id="issues" label="이슈 · 막힌 점 (선택)" error={errors.issues}>
        <Textarea id="issues" name="issues" defaultValue={current?.issues ?? ""} rows={2} maxLength={2000} />
      </Field>
      {state.error && <p className="text-xs text-red-700">{state.error}</p>}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {current ? "이번 주 보고 수정" : "이번 주 보고 제출"}
        </Button>
        {saved && <span className="text-xs text-slate-500">저장되었습니다</span>}
      </div>
    </form>
  );
}
