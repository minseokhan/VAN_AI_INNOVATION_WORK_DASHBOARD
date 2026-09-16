import { formatDate } from "./date";

const DAY_MS = 86_400_000;

/** KST 달력일(YYYY-MM-DD)을 UTC 자정 Date로 — dueDate·@db.Date 저장 규약과 동일 */
function kstDay(d: Date): Date {
  return new Date(`${formatDate(d)}T00:00:00Z`);
}

/** 해당 주 월요일(KST). 시간 성분 없이 UTC 자정으로 정규화 */
export function getWeekStart(d: Date): Date {
  const day = kstDay(d);
  const offset = (day.getUTCDay() + 6) % 7; // 월=0 … 일=6
  return new Date(day.getTime() - offset * DAY_MS);
}

/** "9월 3주차 (9/15~9/21)" — 주차는 그 달의 몇 번째 월요일인지 */
export function formatWeekLabel(weekStart: Date): string {
  const start = kstDay(weekStart);
  const end = new Date(start.getTime() + 6 * DAY_MS);
  const md = (x: Date) => `${x.getUTCMonth() + 1}/${x.getUTCDate()}`;
  const nth = Math.ceil(start.getUTCDate() / 7);
  return `${start.getUTCMonth() + 1}월 ${nth}주차 (${md(start)}~${md(end)})`;
}

export function isCurrentWeek(weekStart: Date, now: Date = new Date()): boolean {
  return getWeekStart(weekStart).getTime() === getWeekStart(now).getTime();
}
