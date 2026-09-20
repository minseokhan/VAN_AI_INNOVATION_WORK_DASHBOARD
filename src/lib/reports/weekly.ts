import { getWeekStart } from "@/lib/utils/week";

const DAY_MS = 86_400_000;
const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

/** ?week=YYYY-MM-DD → 그 주 월요일. 없거나 형식이 틀리면 이번 주 월요일 */
export function parseWeekParam(raw: string | undefined, now: Date = new Date()): Date {
  if (!raw || !DATE_RE.test(raw)) return getWeekStart(now);
  const d = new Date(`${raw}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? getWeekStart(now) : getWeekStart(d);
}

/** 주 단위 이동 (이전 주 -1, 다음 주 +1) */
export function shiftWeek(weekStart: Date, weeks: number): Date {
  return new Date(getWeekStart(weekStart).getTime() + weeks * 7 * DAY_MS);
}
