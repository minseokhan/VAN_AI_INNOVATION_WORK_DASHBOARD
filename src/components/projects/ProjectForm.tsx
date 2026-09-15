"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/(dashboard)/projects/actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { PRIORITY_ORDER } from "@/lib/projects/labels";
import type { ProjectInput } from "@/lib/projects/validation";

export function ProjectForm({
  action,
  defaultValues: d = {},
  categories,
  submitLabel,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  defaultValues?: Partial<ProjectInput>;
  categories: string[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const errors = state.fieldErrors ?? {};
  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="code" label="과제 번호" error={errors.code}>
          <Input id="code" name="code" defaultValue={d.code} placeholder="예: 2-1" required />
        </Field>
        <Field id="priority" label="우선순위" error={errors.priority}>
          <Select id="priority" name="priority" defaultValue={d.priority ?? "中"} required>
            {PRIORITY_ORDER.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field id="title" label="제목" error={errors.title}>
        <Input id="title" name="title" defaultValue={d.title} maxLength={80} required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="category" label="분야" error={errors.category}>
          <Input id="category" name="category" list="category-options" defaultValue={d.category} maxLength={30} required />
          <datalist id="category-options">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field id="dueDate" label="마감일" error={errors.dueDate}>
          <Input id="dueDate" name="dueDate" type="date" defaultValue={d.dueDate} />
        </Field>
      </div>
      <Field id="summary" label="한 줄 요약" error={errors.summary}>
        <Input id="summary" name="summary" defaultValue={d.summary} maxLength={200} required />
      </Field>
      <Field id="description" label="상세 설명" error={errors.description}>
        <Textarea id="description" name="description" defaultValue={d.description} maxLength={5000} rows={8} />
      </Field>
      {state.error && <p className="text-xs text-red-700">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {submitLabel}
      </Button>
    </form>
  );
}
