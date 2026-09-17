"use client";

import { useRouter } from "next/navigation";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { formatWeekLabel } from "@/lib/utils/week";

export function ReportToolbar({ weeks, selected }: { weeks: string[]; selected: string }) {
  const router = useRouter();
  return (
    <div className="no-print mb-6 flex flex-wrap items-center gap-3">
      <Select
        aria-label="주차"
        value={selected}
        onChange={(e) => router.replace(`/reports?week=${e.target.value}`)}
        className="w-auto"
      >
        {weeks.map((w) => (
          <option key={w} value={w}>
            {formatWeekLabel(new Date(`${w}T00:00:00Z`))}
          </option>
        ))}
      </Select>
      <Button variant="secondary" onClick={() => window.print()}>
        <Printer size={16} strokeWidth={1.75} aria-hidden />
        PDF로 저장 · 인쇄
      </Button>
    </div>
  );
}
