"use client";

import { useState, useTransition } from "react";
import { Bell } from "lucide-react";
import { sendReminder } from "@/app/(dashboard)/reports/actions";
import { Button } from "@/components/ui/Button";

/** 미제출 팀에게 디스코드로 독촉. 보낼 메시지를 먼저 보여주고 누르면 전송 */
export function ReminderButton({ week, preview }: { week: string; preview: string[] }) {
  const [result, setResult] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const none = preview.length === 0;

  return (
    <div className="no-print mb-6 rounded-md border border-slate-200 p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold text-slate-900">주간보고 독촉</h2>
        <span className="text-xs text-slate-500">
          {none ? "미제출 팀이 없습니다" : `미제출 ${preview.length}팀에게 디스코드로 보냅니다`}
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
        <ul className="space-y-1 rounded bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
          {preview.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
