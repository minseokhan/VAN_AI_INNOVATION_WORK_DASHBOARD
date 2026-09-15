"use server";

import type { ProjectStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { canEditProject } from "@/lib/auth/permissions";
import { canTransitionStatus, nextOrder, validateFeatureTitle } from "@/lib/projects/features";
import {
  parseProjectInfoForm,
  parseWeeklyForm,
  validateProjectInfo,
  validateWeekly,
  type ProjectInfoInput,
  type WeeklyInput,
} from "@/lib/projects/info";
import { getWeekStart } from "@/lib/utils/week";

export type FormState<K extends string = string> = { error?: string; fieldErrors?: Partial<Record<K, string>> };

/** 세션 확인 → 프로젝트 멤버 조회 → 편집 권한 검사. 실패 시 throw */
async function requireEditor(projectId: string) {
  const user = await requireUser();
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { status: true, members: { select: { userId: true } } },
  });
  if (!project || !canEditProject(user, project.members.map((m) => m.userId))) throw new Error("FORBIDDEN");
  return { user, project };
}

function revalidate(projectId: string) {
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/");
}

export async function toggleFeature(projectId: string, featureId: string, done: boolean): Promise<void> {
  await requireEditor(projectId);
  await db.feature.update({ where: { id: featureId, projectId }, data: { done } });
  revalidate(projectId);
}

export async function addFeature(projectId: string, title: string): Promise<{ error?: string }> {
  const { user } = await requireEditor(projectId);
  const error = validateFeatureTitle(title);
  if (error) return { error };
  const existing = await db.feature.findMany({ where: { projectId }, select: { order: true } });
  await db.feature.create({
    data: { projectId, title: title.trim(), order: nextOrder(existing), createdById: user.id },
  });
  revalidate(projectId);
  return {};
}

export async function deleteFeature(projectId: string, featureId: string): Promise<void> {
  await requireEditor(projectId);
  await db.feature.delete({ where: { id: featureId, projectId } });
  revalidate(projectId);
}

export async function setProjectStatus(projectId: string, to: ProjectStatus): Promise<{ error?: string }> {
  const { project } = await requireEditor(projectId);
  if (!canTransitionStatus(project.status, to, project.members.length)) {
    return { error: "지금 상태에서는 전환할 수 없습니다" };
  }
  await db.project.update({ where: { id: projectId }, data: { status: to } });
  revalidate(projectId);
  return {};
}

export async function updateProjectInfo(
  projectId: string,
  _prev: FormState<keyof ProjectInfoInput>,
  fd: FormData,
): Promise<FormState<keyof ProjectInfoInput>> {
  await requireEditor(projectId);
  const r = validateProjectInfo(parseProjectInfoForm(fd));
  if (!r.ok) return { fieldErrors: r.errors };
  const { startedAt, ...rest } = r.value;
  await db.project.update({
    where: { id: projectId },
    data: { ...rest, startedAt: startedAt ? new Date(startedAt) : null },
  });
  revalidate(projectId);
  return {};
}

/** 이번 주(KST 월요일 기준) 보고를 upsert — 같은 주 재제출은 덮어쓰고 작성자를 갱신 */
export async function submitWeeklyUpdate(
  projectId: string,
  _prev: FormState<keyof WeeklyInput>,
  fd: FormData,
): Promise<FormState<keyof WeeklyInput>> {
  const { user } = await requireEditor(projectId);
  const r = validateWeekly(parseWeeklyForm(fd));
  if (!r.ok) return { fieldErrors: r.errors };
  const weekStart = getWeekStart(new Date());
  await db.weeklyUpdate.upsert({
    where: { projectId_weekStart: { projectId, weekStart } },
    create: { projectId, weekStart, authorId: user.id, ...r.value },
    update: { authorId: user.id, ...r.value },
  });
  revalidate(projectId);
  return {};
}
