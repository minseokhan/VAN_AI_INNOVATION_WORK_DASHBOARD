"use server";

import { Position, type Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { deriveStatusAfterAssign } from "@/lib/projects/status";

const NOT_FOUND = { error: "프로젝트를 찾을 수 없습니다" };

function revalidate(projectId: string) {
  revalidatePath("/assign");
  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
}

/** 멤버 수를 다시 세어 status 전이. 첫 IN_PROGRESS 진입 시 startedAt 설정 */
async function syncStatus(tx: Prisma.TransactionClient, projectId: string) {
  const p = await tx.project.findUniqueOrThrow({
    where: { id: projectId },
    select: { status: true, startedAt: true, _count: { select: { members: true } } },
  });
  const next = deriveStatusAfterAssign(p.status, p._count.members);
  if (next === p.status) return;
  await tx.project.update({
    where: { id: projectId },
    data: { status: next, ...(next === "IN_PROGRESS" && !p.startedAt ? { startedAt: new Date() } : {}) },
  });
}

async function projectExists(projectId: string) {
  return (await db.project.count({ where: { id: projectId } })) > 0;
}

export async function assignMember(projectId: string, userId: string, position: Position = "ETC"): Promise<{ error?: string }> {
  await requireAdmin();
  if (!(position in Position)) return { error: "잘못된 포지션입니다" };
  const [user, exists] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { approved: true } }),
    projectExists(projectId),
  ]);
  if (!exists) return NOT_FOUND;
  if (!user?.approved) return { error: "승인되지 않은 사용자는 배치할 수 없습니다" };
  await db.$transaction(async (tx) => {
    await tx.projectMember.upsert({
      where: { projectId_userId: { projectId, userId } },
      create: { projectId, userId, position },
      update: {}, // 이미 배치된 멤버는 포지션 유지
    });
    await syncStatus(tx, projectId);
  });
  revalidate(projectId);
  return {};
}

export async function unassignMember(projectId: string, userId: string): Promise<{ error?: string }> {
  await requireAdmin();
  if (!(await projectExists(projectId))) return NOT_FOUND;
  await db.$transaction(async (tx) => {
    await tx.projectMember.deleteMany({ where: { projectId, userId } });
    await syncStatus(tx, projectId);
  });
  revalidate(projectId);
  return {};
}

export async function setPosition(projectId: string, userId: string, position: Position): Promise<{ error?: string }> {
  await requireAdmin();
  if (!(position in Position)) return { error: "잘못된 포지션입니다" };
  const { count } = await db.projectMember.updateMany({ where: { projectId, userId }, data: { position } });
  if (count === 0) return { error: "배치되지 않은 멤버입니다" };
  revalidate(projectId);
  return {};
}
