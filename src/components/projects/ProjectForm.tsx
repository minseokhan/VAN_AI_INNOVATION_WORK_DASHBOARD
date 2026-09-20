"use client";

import { Plus, X } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import type { FormState } from "@/app/(dashboard)/projects/actions";
import { Button, buttonClass } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { PRIORITY_LABEL, PRIORITY_ORDER } from "@/lib/projects/labels";
import type { ProjectInput } from "@/lib/projects/validation";

export function ProjectForm({
  action,
  defaultValues: d = {},
  categories,
  submitLabel,
  cancelHref,
  extraActions,
  withFeatures = false,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  defaultValues?: Partial<ProjectInput>;
  categories: string[];
  submitLabel: string;
  cancelHref: string;
  /** 저장 버튼 오른쪽에 붙는 추가 액션 (예: 삭제) */
  extraActions?: React.ReactNode;
  /** 생성 시에만 노출하는 초기 기능 체크리스트 입력 (편집은 상세 페이지에서 관리) */
  withFeatures?: boolean;
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
                {PRIORITY_LABEL[p] ?? p}
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
      {withFeatures && <FeatureListInput error={errors.features} />}
      {state.error && <p className="text-xs text-red-700">{state.error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Link href={cancelHref} className={buttonClass({ variant: "secondary" })}>
          취소
        </Link>
        <Button type="submit" disabled={pending}>
          {submitLabel}
        </Button>
        {extraActions}
      </div>
    </form>
  );
}

/** 생성 시 기능을 하나씩 추가하는 입력. 추가된 항목은 hidden input 으로 함께 전송된다 */
function FeatureListInput({ error }: { error?: string }) {
  const [items, setItems] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    setItems([...items, t]);
    setDraft("");
  };

  return (
    <Field id="feature-draft" label="기능 체크리스트" error={error}>
      {items.length > 0 && (
        <ul className="mb-2 space-y-1">
          {items.map((t, i) => (
            <li key={`${t}-${i}`} className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5">
              <input type="hidden" name="features" value={t} />
              <span className="flex-1 text-sm text-slate-700">{t}</span>
              <button
                type="button"
                aria-label={`${t} 제거`}
                onClick={() => setItems(items.filter((_, j) => j !== i))}
                className="text-slate-400 transition-colors hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500"
              >
                <X size={14} strokeWidth={2} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Input
          id="feature-draft"
          name="features" // +를 누르지 않고 제출해도 입력 중이던 한 줄은 저장된다
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // isComposing: 한글 조합을 확정하는 Enter 는 항목 추가가 아니다 (중복 추가 방지)
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault(); // 폼 제출 대신 항목 추가
              add();
            }
          }}
          maxLength={120}
          placeholder="예: 로그인 화면"
        />
        <Button type="button" variant="secondary" onClick={add} disabled={!draft.trim()} className="shrink-0" aria-label="기능 추가">
          <Plus size={16} strokeWidth={2} aria-hidden />
          추가
        </Button>
      </div>
    </Field>
  );
}
