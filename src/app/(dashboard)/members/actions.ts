"use server";

import type { SkillLevel } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { canChangeRole, canRemoveUser } from "@/lib/members/rules";
import { LEVELS } from "@/lib/profile/validation";
import { calcProgress } from "@/lib/projects/progress";

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

export type MemberDetail = NonNullable<Awaited<ReturnType<typeof getMemberDetail>>>;

/** 상세 패널이 열릴 때만 읽는다 — 목록 쿼리에 프로필·기능까지 싣지 않기 위해 분리 */
export async function getMemberDetail(userId: string) {
  await requireAdmin();
  const u = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true, username: true, name: true, role: true, createdAt: true,
      level: true, adminLevel: true, preferredPosition: true, tools: true, skills: true, interests: true, bio: true,
      profileLinks: { orderBy: { createdAt: "desc" }, select: { id: true, kind: true, title: true, url: true, createdAt: true } },
      memberships: {
        orderBy: { assignedAt: "desc" },
        select: { project: { select: { id: true, code: true, title: true, status: true, features: { select: { done: true } } } } },
      },
    },
  });
  if (!u) return null;
  const { memberships, ...rest } = u;
  return {
    ...rest,
    projects: memberships.map(({ project: { features, ...p } }) => ({ ...p, progress: calcProgress(features) })),
  };
}

/** 운영진이 판단한 수준. 본인이 쓰는 level 과 다른 컬럼이라 서로 덮지 않는다 */
export async function setMemberLevel(userId: string, level: string): Promise<{ error?: string }> {
  await requireAdmin();
  if (level && !(LEVELS as readonly string[]).includes(level)) return { error: "수준 값이 올바르지 않습니다" };
  const { count } = await db.user.updateMany({ where: { id: userId }, data: { adminLevel: (level || null) as SkillLevel | null } });
  if (count === 0) return NOT_FOUND;
  revalidate();
  return {};
}
