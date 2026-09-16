"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { canChangeRole, canRemoveUser } from "@/lib/members/rules";

const NOT_FOUND = { error: "사용자를 찾을 수 없습니다" };

function revalidate() {
  revalidatePath("/members");
  revalidatePath("/", "layout"); // 사이드바 pendingCount
}

export async function approveUser(userId: string): Promise<{ error?: string }> {
  await requireAdmin();
  const { count } = await db.user.updateMany({ where: { id: userId, approved: false }, data: { approved: true } });
  if (count === 0) return NOT_FOUND;
  revalidate();
  return {};
}

/** 미승인 사용자 삭제(거절) */
export async function rejectUser(userId: string): Promise<{ error?: string }> {
  const actor = await requireAdmin();
  const target = await db.user.findUnique({ where: { id: userId }, select: { id: true, approved: true } });
  if (!target) return NOT_FOUND;
  const r = canRemoveUser(actor, target);
  if (!r.ok) return { error: r.reason };
  await db.user.delete({ where: { id: userId } });
  revalidate();
  return {};
}

export async function setRole(userId: string, role: "ADMIN" | "MEMBER"): Promise<{ error?: string }> {
  const actor = await requireAdmin();
  if (role !== "ADMIN" && role !== "MEMBER") return { error: "잘못된 역할입니다" };
  const [target, adminCount] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { id: true } }),
    db.user.count({ where: { role: "ADMIN" } }),
  ]);
  if (!target) return NOT_FOUND;
  const r = canChangeRole(actor, target, adminCount, role);
  if (!r.ok) return { error: r.reason };
  // 부원으로 내리면 운영진 구분 라벨도 제거
  await db.user.update({ where: { id: userId }, data: role === "ADMIN" ? { role } : { role, adminType: null } });
  revalidate();
  return {};
}
