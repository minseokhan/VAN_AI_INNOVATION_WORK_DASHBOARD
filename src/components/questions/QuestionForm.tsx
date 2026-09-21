"use client";

import { useActionState } from "react";
import { askQuestion } from "@/app/(dashboard)/questions/actions";
import type { FormState } from "@/app/(dashboard)/projects/[id]/actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useRetainOnError } from "@/components/ui/useRetainOnError";

export type QuestionProjectOption = { id: string; code: string; title: string };

export function QuestionForm({ projects, defaultProjectId }: { projects: QuestionProjectOption[]; defaultProjectId?: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(askQuestion, {});
  const { formRef, submit } = useRetainOnError(formAction, state);
  const errors = state.fieldErrors ?? {};
  const selected = projects.some((p) => p.id === defaultProjectId) ? defaultProjectId : projects[0]?.id;
  return (
    <form ref={formRef} action={submit} className="space-y-3 rounded-md border border-slate-200 p-4">
      <Field id="q-project" label="프로젝트" error={errors.projectId}>
        <Select id="q-project" name="projectId" defaultValue={selected} required>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.code} · {p.title}
            </option>
          ))}
        </Select>
      </Field>
      <Field id="q-visibility" label="공개 범위">
        <Select id="q-visibility" name="visibility" defaultValue="PUBLIC">
          <option value="PUBLIC">공개 — 모든 부원이 볼 수 있음</option>
          <option value="PRIVATE">비공개 — 운영진과 나만 볼 수 있음</option>
        </Select>
      </Field>
      <Field id="q-content" label="질문" error={errors.content}>
        <Textarea id="q-content" name="content" rows={3} maxLength={2000} required placeholder="기획 문의, 방향 확인, 피드백 요청 등" />
      </Field>
      {state.error && <p className="text-xs text-red-700">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        질문 남기기
      </Button>
    </form>
  );
}
