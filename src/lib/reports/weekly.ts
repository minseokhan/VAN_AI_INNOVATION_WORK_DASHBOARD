import { getWeekStart } from "@/lib/utils/week";

const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

/** ?week=YYYY-MM-DD → 그 주 월요일. 없거나 형식이 틀리면 이번 주 월요일 */
export function parseWeekParam(raw: string | undefined, now: Date = new Date()): Date {
  if (!raw || !DATE_RE.test(raw)) return getWeekStart(now);
  const d = new Date(`${raw}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? getWeekStart(now) : getWeekStart(d);
}

/** 보고가 있는 주 + 이번 주, 중복 제거 후 최신순 */
export function weekOptions(weekStarts: Date[], now: Date = new Date()): Date[] {
  const times = new Set(weekStarts.map((d) => getWeekStart(d).getTime()));
  times.add(getWeekStart(now).getTime());
  return [...times].sort((a, b) => b - a).map((t) => new Date(t));
}
