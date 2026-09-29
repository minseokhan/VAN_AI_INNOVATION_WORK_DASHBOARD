"use client";

import { useState, useTransition } from "react";
import { Bell, ChevronDown } from "lucide-react";
import { sendReminder } from "@/app/(dashboard)/reports/actions";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

/** 미제출 팀에게 디스코드로 독촉. 미리보기는 실제로 전송될 메시지 전문 그대로다 */
export function ReminderButton({ week, teams, messages }: { week: string; teams: number; messages: string[] }) {
  const [result, setResult] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();
  const none = messages.length === 0;

  return (
    <div className="no-print mb-6 rounded-md border border-slate-200 p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold text-slate-900">주간보고 독촉</h2>
        <span className="text-xs text-slate-500">
          {none ? "미제출 팀이 없습니다" : `미제출 ${teams}팀 · 아래 내용 그대로 디스코드로 전송됩니다`}
        </span>
        <Button
          size="sm"
          variant="secondary"
          className="ml-auto"
          disabled={pending || none}
          onClick={() =>
            startTransition(async () => {
              const r = await sendReminder(week);
              setResult(r.error ?? `${r.sent}팀에게 보냈습니다`);
            })
          }
        >
          <Bell size={16} strokeWidth={1.75} aria-hidden />
          독촉 보내기
        </Button>
        {result && <span className="text-xs text-slate-500">{result}</span>}
      </div>
      {!none && (
        <>
          <div className={cn("space-y-2", !expanded && "max-h-40 overflow-hidden")}>
            {messages.map((m, i) => (
              <pre
                key={i}
                className="overflow-x-auto whitespace-pre-wrap break-words rounded border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs leading-relaxed text-slate-700"
              >
                {m}
              </pre>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            className="mt-2 flex w-full items-center justify-center gap-1 rounded-md py-1.5 text-xs text-navy-500 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500"
          >
            {expanded ? "접기" : "전체 내용 보기"}
            <ChevronDown size={14} strokeWidth={2} aria-hidden className={cn("transition-transform", expanded && "rotate-180")} />
          </button>
        </>
      )}
    </div>
  );
}
