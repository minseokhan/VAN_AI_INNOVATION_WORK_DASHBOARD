"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { validateNotice } from "@/lib/notices/rules";
import type { FormState } from "@/app/(dashboard)/projects/[id]/actions";

function revalidate() {
  revalidatePath("/notices");
}

function parse(fd: FormData) {
  return validateNotice({ title: String(fd.get("title") ?? ""), content: String(fd.get("content") ?? "") });
}

export async function createNotice(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const result = parse(fd);
  if (!result.ok) return { fieldErrors: result.errors };
  await db.notice.create({ data: { ...result.value, authorId: user.id } });
  revalidate();
  return { ok: true };
}

export async function updateNotice(noticeId: string, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const result = parse(fd);
  if (!result.ok) return { fieldErrors: result.errors };
  const { count } = await db.notice.updateMany({ where: { id: noticeId }, data: result.value });
  if (count === 0) return { error: "공지를 찾을 수 없습니다" };
  revalidate();
  return { ok: true };
}

export async function deleteNotice(noticeId: string): Promise<{ error?: string }> {
  await requireAdmin();
  const { count } = await db.notice.deleteMany({ where: { id: noticeId } });
  if (count === 0) return { error: "공지를 찾을 수 없습니다" };
  revalidate();
  return {};
}
