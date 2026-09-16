"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin, requireUser } from "@/lib/auth/guards";
import { canAskFor, canDeleteQuestion, validateAnswer, validateQuestion } from "@/lib/questions/rules";
import type { FormState } from "@/app/(dashboard)/projects/[id]/actions";

function revalidate(projectId: string) {
  revalidatePath("/questions");
  revalidatePath(`/projects/${projectId}`);
}

export async function askQuestion(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const projectId = String(fd.get("projectId") ?? "");
  const content = String(fd.get("content") ?? "");
  if (!projectId) return { fieldErrors: { projectId: "프로젝트를 선택하세요" } };
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { members: { select: { userId: true } } },
  });
  if (!project || !canAskFor(user, project.members.map((m) => m.userId))) {
    return { error: "이 프로젝트에 질문할 권한이 없습니다" };
  }
  const error = validateQuestion(content);
  if (error) return { fieldErrors: { content: error } };
  await db.question.create({ data: { projectId, authorId: user.id, content: content.trim() } });
  revalidate(projectId);
  return {};
}

export async function answerQuestion(questionId: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const answer = String(fd.get("answer") ?? "");
  const error = validateAnswer(answer);
  if (error) return { fieldErrors: { answer: error } };
  const q = await db.question.update({
    where: { id: questionId },
    data: { answer: answer.trim(), answeredById: user.id, answeredAt: new Date() },
    select: { projectId: true },
  });
  revalidate(q.projectId);
  return {};
}

export async function deleteQuestion(questionId: string): Promise<{ error?: string }> {
  const user = await requireUser();
  const q = await db.question.findUnique({
    where: { id: questionId },
    select: { authorId: true, answer: true, projectId: true },
  });
  if (!q) return { error: "질문을 찾을 수 없습니다" };
  if (!canDeleteQuestion(user, q)) return { error: "삭제할 수 없는 질문입니다" };
  await db.question.delete({ where: { id: questionId } });
  revalidate(q.projectId);
  return {};
}
