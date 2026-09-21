"use client";

import { useActionState, useState } from "react";
import { updateProjectInfo, type FormState } from "@/app/(dashboard)/projects/[id]/actions";
import { SidePanel } from "@/components/projects/SidePanel";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useRetainOnError } from "@/components/ui/useRetainOnError";
import { LANGUAGE_OPTIONS, type ProjectInfoInput } from "@/lib/projects/info";

export type ProjectInfo = Record<keyof ProjectInfoInput, string | null>; // startedAt은 "YYYY-MM-DD"

function InfoRow({ label, value, href }: { label: string; value: string | null; href?: boolean }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="min-w-0 truncate text-right text-slate-700">
        {!value ? (
          <span className="text-slate-400">미입력</span>
        ) : href ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-navy-500 hover:underline break-all">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

export function ProjectInfoPanel({ projectId, info, canEdit }: { projectId: string; info: ProjectInfo; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  const initialLang = !info.mainLanguage ? "" : LANGUAGE_OPTIONS.includes(info.mainLanguage) ? info.mainLanguage : "기타";
  const [lang, setLang] = useState(initialLang);
  const [state, formAction, pending] = useActionState<FormState<keyof ProjectInfoInput>, FormData>(
    async (prev, fd) => {
      const r = await updateProjectInfo(projectId, prev, fd);
      if (!r.error && !r.fieldErrors) setEditing(false);
      return r;
    },
    {},
  );
  const { formRef, submit } = useRetainOnError(formAction, state);
  const errors = state.fieldErrors ?? {};

  return (
    <SidePanel
      title="초기 정보"
      action={
        canEdit && !editing ? (
          <Button variant="text" size="sm" onClick={() => setEditing(true)}>
            편집
          </Button>
        ) : undefined
      }
    >
      {editing ? (
        <form ref={formRef} action={submit} className="space-y-3">
          <Field id="githubUrl" label="GitHub" error={errors.githubUrl}>
            <Input id="githubUrl" name="githubUrl" type="url" defaultValue={info.githubUrl ?? ""} placeholder="https://github.com/…" />
          </Field>
          <Field id="deployUrl" label="배포" error={errors.deployUrl}>
            <Input id="deployUrl" name="deployUrl" type="url" defaultValue={info.deployUrl ?? ""} placeholder="https://…" />
          </Field>
          <Field id="mainLanguage" label="주 언어" error={errors.mainLanguage}>
            <Select id="mainLanguage" name="mainLanguage" value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="">선택 안 함</option>
              {LANGUAGE_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
            {lang === "기타" && (
              <Input
                name="mainLanguageOther"
                aria-label="주 언어 직접 입력"
                className="mt-2"
                defaultValue={initialLang === "기타" ? (info.mainLanguage ?? "") : ""}
                placeholder="직접 입력"
                maxLength={30}
              />
            )}
          </Field>
          <Field id="infraNote" label="인프라" error={errors.infraNote}>
            <Textarea id="infraNote" name="infraNote" defaultValue={info.infraNote ?? ""} rows={3} maxLength={500} />
          </Field>
          <Field id="startedAt" label="시작일" error={errors.startedAt}>
            <Input id="startedAt" name="startedAt" type="date" defaultValue={info.startedAt ?? ""} />
          </Field>
          {state.error && <p className="text-xs text-red-700">{state.error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              저장
            </Button>
            <Button variant="secondary" size="sm" disabled={pending} onClick={() => setEditing(false)}>
              취소
            </Button>
          </div>
        </form>
      ) : (
        <dl className="space-y-2">
          <InfoRow label="GitHub" value={info.githubUrl} href />
          <InfoRow label="배포" value={info.deployUrl} href />
          <InfoRow label="주 언어" value={info.mainLanguage} />
          <InfoRow label="인프라" value={info.infraNote} />
        </dl>
      )}
    </SidePanel>
  );
}
