"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { shiftWeek } from "@/lib/reports/weekly";
import { cn } from "@/lib/utils/cn";

const ymd = (d: Date) => d.toISOString().slice(0, 10);

export function ReportToolbar({ week, thisWeek }: { week: string; thisWeek: string }) {
  const router = useRouter();
  const go = (w: string) => router.replace(`/reports?week=${w}`);
  const move = (weeks: number) => go(ymd(shiftWeek(new Date(`${week}T00:00:00Z`), weeks)));
  const isThisWeek = week === thisWeek;
  const end = ymd(new Date(new Date(`${week}T00:00:00Z`).getTime() + 6 * 86_400_000));

  // 인쇄물에는 접힌 카드까지 전부 펼쳐져 나와야 한다
  useEffect(() => {
    const openAll = () => document.querySelectorAll("details").forEach((d) => (d.open = true));
    window.addEventListener("beforeprint", openAll);
    return () => window.removeEventListener("beforeprint", openAll);
  }, []);

  const nav = "px-3 py-1.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500 disabled:cursor-default disabled:text-slate-300 enabled:text-slate-600 enabled:hover:bg-slate-50";

  return (
    <div className="no-print mb-6 flex flex-wrap items-center gap-3">
      <div role="group" aria-label="주차 이동" className="inline-flex rounded-md border border-slate-300">
        <button type="button" onClick={() => move(-1)} className={cn(nav, "rounded-l-md")}>
          ← 이전 주
        </button>
        <button
          type="button"
          onClick={() => go(thisWeek)}
          disabled={isThisWeek}
          className={cn(nav, "border-x border-slate-300")}
        >
          이번 주
        </button>
        <button type="button" onClick={() => move(1)} disabled={week >= thisWeek} className={cn(nav, "rounded-r-md")}>
          다음 주 →
        </button>
      </div>
      <span className="text-sm tabular-nums text-slate-600">
        {week} ~ {end}
      </span>
      <Button variant="secondary" className="ml-auto" onClick={() => window.print()}>
        <Printer size={16} strokeWidth={1.75} aria-hidden />
        PDF로 저장 · 인쇄
      </Button>
    </div>
  );
}
