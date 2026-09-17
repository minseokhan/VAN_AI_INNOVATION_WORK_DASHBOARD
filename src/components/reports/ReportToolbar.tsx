"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { formatMonthLabel, shiftWeek, weeksInMonth } from "@/lib/reports/weekly";
import { formatWeekLabel } from "@/lib/utils/week";

const ymd = (d: Date) => d.toISOString().slice(0, 10);

/** 월 → 주차 2단 선택. 주가 쌓여도 드롭다운 길이가 한 달치로 고정된다 */
export function ReportToolbar({ months, week }: { months: string[]; week: string }) {
  const router = useRouter();
  const go = (w: string) => router.replace(`/reports?week=${w}`);
  const month = week.slice(0, 7);
  const weeks = weeksInMonth(month);

  // 인쇄물에는 접힌 카드까지 전부 펼쳐져 나와야 한다
  useEffect(() => {
    const openAll = () => document.querySelectorAll("details").forEach((d) => (d.open = true));
    window.addEventListener("beforeprint", openAll);
    return () => window.removeEventListener("beforeprint", openAll);
  }, []);

  return (
    <div className="no-print mb-6 flex flex-wrap items-center gap-2">
      <Select
        aria-label="월"
        value={months.includes(month) ? month : months[0]}
        onChange={(e) => go(ymd(weeksInMonth(e.target.value)[0]))}
        className="w-auto"
      >
        {months.map((m) => (
          <option key={m} value={m}>
            {formatMonthLabel(m)}
          </option>
        ))}
      </Select>

      <Select aria-label="주차" value={week} onChange={(e) => go(e.target.value)} className="w-auto">
        {weeks.map((d) => (
          <option key={ymd(d)} value={ymd(d)}>
            {formatWeekLabel(d)}
          </option>
        ))}
      </Select>

      <div className="inline-flex rounded-md border border-slate-300">
        <button
          type="button"
          aria-label="이전 주"
          onClick={() => go(ymd(shiftWeek(new Date(`${week}T00:00:00Z`), -1)))}
          className="rounded-l-md px-2 py-1.5 text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500"
        >
          <ChevronLeft size={16} strokeWidth={1.75} />
        </button>
        <button
          type="button"
          aria-label="다음 주"
          onClick={() => go(ymd(shiftWeek(new Date(`${week}T00:00:00Z`), 1)))}
          className="rounded-r-md border-l border-slate-300 px-2 py-1.5 text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500"
        >
          <ChevronRight size={16} strokeWidth={1.75} />
        </button>
      </div>

      <Button variant="secondary" className="ml-auto" onClick={() => window.print()}>
        <Printer size={16} strokeWidth={1.75} aria-hidden />
        PDF로 저장 · 인쇄
      </Button>
    </div>
  );
}
