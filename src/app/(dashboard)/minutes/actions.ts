"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { validateMinute } from "@/lib/minutes/rules";
import type { FormState } from "@/app/(dashboard)/projects/[id]/actions";

export async function createMinute(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const result = validateMinute({
    date: String(fd.get("date") ?? ""),
    title: String(fd.get("title") ?? ""),
    fileUrl: String(fd.get("fileUrl") ?? ""),
  });
  if (!result.ok) return { fieldErrors: result.errors };
  await db.meetingMinute.create({ data: { ...result.value, authorId: user.id } });
  revalidatePath("/minutes");
  return { ok: true };
}

export async function deleteMinute(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const { count } = await db.meetingMinute.deleteMany({ where: { id } });
  if (count === 0) return { error: "회의록을 찾을 수 없습니다" };
  revalidatePath("/minutes");
  return {};
}
