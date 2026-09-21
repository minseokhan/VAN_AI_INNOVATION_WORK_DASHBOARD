"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useActionState, useState } from "react";
import { answerQuestion, deleteQuestion } from "@/app/(dashboard)/questions/actions";
import type { FormState } from "@/app/(dashboard)/projects/[id]/actions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { Field } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Textarea";
import { useRetainOnError } from "@/components/ui/useRetainOnError";
import { formatDate } from "@/lib/utils/date";

export type QuestionItem = {
  id: string;
  projectId: string;
  projectCode: string;
  projectTitle: string;
  authorName: string;
  content: string;
  createdAt: Date;
  answer: string | null;
  answererName: string | null;
  answeredAt: Date | null;
  sentToDiscordAt: Date | null;
  isPrivate: boolean;
  /** 볼 권한이 없어 본문이 서버에서 지워진 상태 */
  masked: boolean;
};

export function QuestionCard({ q, isAdmin, canDelete }: { q: QuestionItem; isAdmin: boolean; canDelete: boolean }) {
  const [answering, setAnswering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState<FormState, FormData>(async (prev, fd) => {
    const r = await answerQuestion(q.id, prev, fd);
    if (!r.error && !r.fieldErrors) setAnswering(false);
    return r;
  }, {});
  const { formRef, submit } = useRetainOnError(formAction, state);

  if (q.masked) {
    return (
      <li className="rounded-md border border-slate-200 bg-white p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <Link href={`/projects/${q.projectId}`} className="font-medium text-navy-500 hover:underline">
            {q.projectCode} · {q.projectTitle}
          </Link>
          <span className="inline-flex items-center gap-1 text-slate-400">
            <Lock size={12} strokeWidth={2} aria-hidden />
            비공개 질문
          </span>
        </div>
        <p aria-hidden className="select-none text-sm leading-relaxed text-slate-400 blur-[3px]">
          비공개로 등록된 질문입니다 운영진과 작성자만 내용을 확인할 수 있습니다
        </p>
        <p className="sr-only">작성자와 운영진만 볼 수 있는 비공개 질문입니다</p>
      </li>
    );
  }

  return (
    <li className="rounded-md border border-slate-200 bg-white p-5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/projects/${q.projectId}`} className="font-medium text-navy-500 hover:underline">
            {q.projectCode} · {q.projectTitle}
          </Link>
          <span>
            {q.authorName} · {formatDate(q.createdAt)}
          </span>
          {q.sentToDiscordAt && <span className="text-slate-400">디스코드 전송됨 · {formatDate(q.sentToDiscordAt)}</span>}
        </div>
        <div className="flex items-center gap-2">
          {q.isPrivate && <Badge tone="neutral">비공개</Badge>}
          {!q.answer && <Badge tone="amber">미답변</Badge>}
        </div>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{q.content}</p>

      {q.answer && !answering && (
        <div className="mt-3 rounded-md bg-navy-50 p-3">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{q.answer}</p>
          <p className="mt-2 text-xs text-slate-500">
            {q.answererName ?? "운영진"} 답변 · {q.answeredAt ? formatDate(q.answeredAt) : ""}
          </p>
        </div>
      )}

      {answering && (
        <form ref={formRef} action={submit} className="mt-3 space-y-2">
          <Field id={`answer-${q.id}`} label="답변" error={state.fieldErrors?.answer}>
            <Textarea id={`answer-${q.id}`} name="answer" rows={3} maxLength={4000} defaultValue={q.answer ?? ""} required />
          </Field>
          {state.error && <p className="text-xs text-red-700">{state.error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              저장
            </Button>
            <Button variant="secondary" size="sm" disabled={pending} onClick={() => setAnswering(false)}>
              취소
            </Button>
          </div>
        </form>
      )}

      {(isAdmin || canDelete) && !answering && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {isAdmin && (
            <Button variant="text" size="sm" onClick={() => setAnswering(true)}>
              {q.answer ? "답변 수정" : "답변하기"}
            </Button>
          )}
          {canDelete && (
            <ConfirmButton
              label="삭제"
              confirmLabel="삭제"
              message="이 질문을 삭제할까요?"
              size="sm"
              onConfirm={() => deleteQuestion(q.id).then((r) => setError(r.error ?? null))}
            />
          )}
          {error && <p className="text-xs text-red-700">{error}</p>}
        </div>
      )}
    </li>
  );
}
