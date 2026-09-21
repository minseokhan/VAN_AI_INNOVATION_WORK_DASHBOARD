"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { parseFeatureList } from "@/lib/projects/features";
import { parseProjectForm, validateProject, type ProjectInput } from "@/lib/projects/validation";

export type FormState = { error?: string; fieldErrors?: Partial<Record<keyof ProjectInput | "features", string>> };

const DUPLICATE_CODE: FormState = { fieldErrors: { code: "이미 사용 중인 과제 번호입니다" } };

function isUniqueViolation(e: unknown) {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}

function toData({ dueDate, ...v }: ProjectInput) {
  return { ...v, dueDate: dueDate ? new Date(dueDate) : null };
}

export async function createProject(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const r = validateProject(parseProjectForm(fd));
  if (!r.ok) return { fieldErrors: r.errors };
  const features = parseFeatureList(fd.getAll("features").filter((v) => typeof v === "string"));
  if (!features.ok) return { fieldErrors: { features: features.error } };
  let id: string;
  try {
    ({ id } = await db.project.create({
      data: {
        ...toData(r.value),
        features: { create: features.titles.map((title, order) => ({ title, order, createdById: user.id })) },
      },
      select: { id: true },
    }));
  } catch (e) {
    if (isUniqueViolation(e)) return DUPLICATE_CODE;
    throw e;
  }
  revalidatePath("/");
  redirect(`/projects/${id}`);
}

export async function updateProject(id: string, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const r = validateProject(parseProjectForm(fd));
  if (!r.ok) return { fieldErrors: r.errors };
  try {
    await db.project.update({ where: { id }, data: toData(r.value) });
  } catch (e) {
    if (isUniqueViolation(e)) return DUPLICATE_CODE;
    throw e;
  }
  revalidatePath("/");
  revalidatePath(`/projects/${id}`);
  redirect(`/projects/${id}`);
}

export async function deleteProject(id: string): Promise<void> {
  await requireAdmin();
  await db.project.delete({ where: { id } }); // 하위 데이터는 schema의 onDelete: Cascade
  revalidatePath("/");
  redirect("/");
}
