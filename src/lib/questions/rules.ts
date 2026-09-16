import { isAdmin } from "@/lib/auth/permissions";

export function validateQuestion(content: string): string | null {
  const len = content.trim().length;
  if (len === 0) return "질문 내용을 입력하세요";
  if (len > 2000) return "질문은 2000자 이하로 입력하세요";
  return null;
}

export function validateAnswer(content: string): string | null {
  const len = content.trim().length;
  if (len === 0) return "답변 내용을 입력하세요";
  if (len > 4000) return "답변은 4000자 이하로 입력하세요";
  return null;
}

/** 팀원 또는 ADMIN만 질문 가능 */
export function canAskFor(user: { id: string; role: string }, memberUserIds: string[]): boolean {
  return isAdmin(user) || memberUserIds.includes(user.id);
}

/** 작성자 본인이고 미답변이거나, ADMIN */
export function canDeleteQuestion(
  user: { id: string; role: string },
  q: { authorId: string; answer: string | null },
): boolean {
  return isAdmin(user) || (q.authorId === user.id && q.answer === null);
}

export type QuestionFilter = { scope: "ALL" | "MINE" | "UNANSWERED"; project?: string };

export function filterQuestions<
  T extends { projectId: string; answer: string | null; project: { memberIds: string[] } },
>(qs: T[], f: QuestionFilter, userId: string): T[] {
  return qs.filter((q) => {
    if (f.project && q.projectId !== f.project) return false;
    if (f.scope === "MINE") return q.project.memberIds.includes(userId);
    if (f.scope === "UNANSWERED") return q.answer === null;
    return true;
  });
}
