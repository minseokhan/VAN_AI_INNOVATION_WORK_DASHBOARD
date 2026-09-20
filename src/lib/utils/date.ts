const TZ = "Asia/Seoul";
const DAY_MS = 86_400_000;

/** "2026-09-15" — 서버 타임존과 무관하게 KST 날짜로 표기 */
export function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("sv-SE", { timeZone: TZ });
}

/** KST 달력일 차이(now - d). 과거면 양수 */
export function daysSince(d: Date | string, now: Date = new Date()): number {
  return Math.round((Date.parse(formatDate(now)) - Date.parse(formatDate(d))) / DAY_MS);
}

/** KST 달력일 차이: "오늘" / "3일 전" / "2일 후" */
export function relativeDays(d: Date | string, now: Date = new Date()): string {
  const diff = daysSince(d, now);
  if (diff === 0) return "오늘";
  return diff > 0 ? `${diff}일 전` : `${-diff}일 후`;
}

/** "9/15 14:20" — KST 기준 날짜+시각 */
export function formatDateTime(d: Date | string): string {
  const [date, time] = new Date(d)
    .toLocaleString("sv-SE", { timeZone: TZ, hour12: false })
    .split(" ");
  const [, m, day] = date.split("-");
  return `${Number(m)}/${Number(day)} ${time.slice(0, 5)}`;
}
