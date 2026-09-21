import type { ExpenseKind } from "@prisma/client";
import type { BadgeTone } from "@/components/ui/Badge";
import { isAdmin } from "@/lib/auth/permissions";
import { formatDate } from "@/lib/utils/date";

export const EXPENSE_KINDS = ["SPENT", "PLANNED"] as const satisfies readonly ExpenseKind[];

export const EXPENSE_KIND_LABEL: Record<ExpenseKind, string> = {
  SPENT: "사용 완료",
  PLANNED: "사용 예정",
};

export const EXPENSE_KIND_TONE: Record<ExpenseKind, BadgeTone> = {
  SPENT: "navy",
  PLANNED: "amber",
};

export const MAX_EXPENSE_TITLE = 100;
export const MAX_EXPENSE_NOTE = 1000;
export const MAX_EXPENSE_AMOUNT = 100_000_000;

/** "12,000" → 12000. 0 이하·소수·상한 초과는 null */
export function parseAmount(v: string): number | null {
  const s = v.replace(/,/g, "").trim();
  if (!/^\d+$/.test(s)) return null;
  const n = Number(s);
  return n > 0 && n <= MAX_EXPENSE_AMOUNT ? n : null;
}

/** "YYYY-MM"만 통과 */
export function parseMonth(v: string): string | null {
  const m = /^(\d{4})-(\d{2})$/.exec(v.trim());
  if (!m) return null;
  const month = Number(m[2]);
  return month >= 1 && month <= 12 ? v.trim() : null;
}

/** KST 기준 이번 달 "YYYY-MM" */
export function currentMonth(now: Date = new Date()): string {
  return formatDate(now).slice(0, 7);
}

export function nextMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
}

export function formatMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return `${y}년 ${m}월`;
}

export function formatAmount(n: number): string {
  return `${n.toLocaleString("ko-KR")}원`;
}

export function parseExpenseKind(v: string): ExpenseKind | null {
  return (EXPENSE_KINDS as readonly string[]).includes(v) ? (v as ExpenseKind) : null;
}

export type ExpenseRawInput = { month: string; kind: string; title: string; amount: string; note?: string };

export function validateExpense(input: ExpenseRawInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!parseMonth(input.month)) errors.month = "청구 월을 선택하세요";
  if (!parseExpenseKind(input.kind)) errors.kind = "구분을 선택하세요";

  const title = input.title.trim();
  if (title.length === 0) errors.title = "항목명을 입력하세요";
  else if (title.length > MAX_EXPENSE_TITLE) errors.title = `항목명은 ${MAX_EXPENSE_TITLE}자 이하로 입력하세요`;

  if (parseAmount(input.amount) === null) errors.amount = "금액을 숫자로 입력하세요";

  if ((input.note ?? "").trim().length > MAX_EXPENSE_NOTE) errors.note = `청구 내용은 ${MAX_EXPENSE_NOTE}자 이하로 입력하세요`;

  return errors;
}

/** 작성자 본인이거나 운영진 */
export function canDeleteExpense(user: { id: string; role: string }, item: { userId: string }): boolean {
  return isAdmin(user) || item.userId === user.id;
}

export type ExpenseSummaryItem = { userId: string; userName: string; kind: ExpenseKind; amount: number };

export type ExpenseGroup<T extends ExpenseSummaryItem> = {
  userId: string;
  userName: string;
  items: T[];
  spent: number;
  planned: number;
};

/** 사람별로 묶고 구분별 합계를 낸다. 입력 순서대로 사람이 나온다 */
export function groupByUser<T extends ExpenseSummaryItem>(items: T[]): ExpenseGroup<T>[] {
  const groups = new Map<string, ExpenseGroup<T>>();
  for (const item of items) {
    let g = groups.get(item.userId);
    if (!g) {
      g = { userId: item.userId, userName: item.userName, items: [], spent: 0, planned: 0 };
      groups.set(item.userId, g);
    }
    g.items.push(item);
    if (item.kind === "SPENT") g.spent += item.amount;
    else g.planned += item.amount;
  }
  return [...groups.values()];
}
