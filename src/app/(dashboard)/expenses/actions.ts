"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { canDeleteExpense, parseAmount, parseExpenseKind, parseMonth, validateExpense } from "@/lib/expenses/rules";
import type { FormState } from "@/app/(dashboard)/projects/[id]/actions";

export async function addExpense(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const raw = {
    month: String(fd.get("month") ?? ""),
    kind: String(fd.get("kind") ?? ""),
    title: String(fd.get("title") ?? ""),
    amount: String(fd.get("amount") ?? ""),
    note: String(fd.get("note") ?? ""),
  };
  const fieldErrors = validateExpense(raw);
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const receiptUrl = String(fd.get("receiptUrl") ?? "").trim();
  if (receiptUrl && !receiptUrl.startsWith("https://")) return { fieldErrors: { receiptUrl: "영수증 주소가 올바르지 않습니다" } };

  await db.expenseClaim.create({
    data: {
      userId: user.id,
      month: parseMonth(raw.month)!,
      kind: parseExpenseKind(raw.kind)!,
      title: raw.title.trim(),
      amount: parseAmount(raw.amount)!,
      note: raw.note.trim() || null,
      receiptUrl: receiptUrl || null,
    },
  });
  revalidatePath("/expenses");
  return { ok: true };
}

export async function deleteExpense(id: string): Promise<{ error?: string }> {
  const user = await requireUser();
  const item = await db.expenseClaim.findUnique({ where: { id }, select: { userId: true } });
  if (!item) return { error: "청구 항목을 찾을 수 없습니다" };
  if (!canDeleteExpense(user, item)) return { error: "삭제할 권한이 없습니다" };
  await db.expenseClaim.delete({ where: { id } });
  revalidatePath("/expenses");
  return {};
}
