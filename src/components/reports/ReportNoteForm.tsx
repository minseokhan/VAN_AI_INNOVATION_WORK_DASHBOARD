"use client";

import { useState, useTransition } from "react";
import { saveReportNote } from "@/app/(dashboard)/reports/actions";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

/** 주차별 운영진 총평. 인쇄물에도 그대로 실린다 */
export function ReportNoteForm({
  week,
  initial,
  meta,
}: {
  week: string;
  initial: string;
  meta: string | null;
}) {
  const [content, setContent] = useState(initial);
  const [result, setResult] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const dirty = content !== initial;

  return (
    <section className="mb-6 rounded-md border border-slate-200 p-4">
      <div className="mb-2 flex flex-wrap items-baseline gap-2">
        <h2 className="text-sm font-semibold text-slate-900">운영진 특이사항 · 총평</h2>
        {meta && <span className="text-xs text-slate-500">{meta}</span>}
      </div>

      {content.trim() && (
        <p className="hidden whitespace-pre-line text-sm leading-relaxed text-slate-800 print:block">{content}</p>
      )}

      <div className="no-print">
        <Textarea
          aria-label="운영진 특이사항 · 총평"
          rows={4}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setResult(null);
          }}
          placeholder="이번 주 전체 진행 상황, 공지, 다음 주 일정 등을 적어두면 인쇄물에도 포함됩니다"
        />
        <div className="mt-2 flex items-center gap-2">
          <Button
            size="sm"
            disabled={pending || !dirty}
            onClick={() =>
              startTransition(async () => {
                const r = await saveReportNote(week, content);
                setResult(r.error ?? "저장했습니다");
              })
            }
          >
            저장
          </Button>
          {result && <span className="text-xs text-slate-500">{result}</span>}
        </div>
      </div>
    </section>
  );
}
