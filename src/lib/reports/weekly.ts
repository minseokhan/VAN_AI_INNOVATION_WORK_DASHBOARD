import { getWeekStart } from "@/lib/utils/week";

const DAY_MS = 86_400_000;
const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

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

const toMonth = (d: Date) => d.toISOString().slice(0, 7);

/**
 * 선택 가능한 달(YYYY-MM) 목록, 최신순.
 * 가장 이른 보고가 있는 달부터 이번 달까지를 빈 달 없이 채운다 — 보고가 쌓여도
 * 드롭다운이 무한히 길어지지 않도록 주차는 달 안에서 다시 고른다.
 */
export function monthOptions(weekStarts: Date[], now: Date = new Date()): string[] {
  const months = [...weekStarts.map(toMonth), toMonth(getWeekStart(now))].sort();
  const [first, last] = [months[0], months[months.length - 1]];
  const out: string[] = [];
  for (let [y, m] = first.split("-").map(Number); `${y}-${String(m).padStart(2, "0")}` <= last; m++) {
    if (m > 12) [y, m] = [y + 1, 1];
    out.push(`${y}-${String(m).padStart(2, "0")}`);
  }
  return out.reverse();
}

/** 그 달에 속한 월요일들, 오름차순 */
export function weeksInMonth(month: string): Date[] {
  if (!MONTH_RE.test(month)) return [];
  const first = new Date(`${month}-01T00:00:00Z`);
  const out: Date[] = [];
  for (let d = getWeekStart(first); toMonth(d) <= month; d = new Date(d.getTime() + 7 * DAY_MS)) {
    if (toMonth(d) === month) out.push(d);
  }
  return out;
}

export function formatMonthLabel(month: string): string {
  const [y, m] = month.split("-");
  return `${y}년 ${Number(m)}월`;
}
