import type { InquiryKind } from "@prisma/client";
import type { BadgeTone } from "@/components/ui/Badge";
import { isAdmin } from "@/lib/auth/permissions";

export const INQUIRY_KINDS = ["QUESTION", "SUGGESTION", "BUG"] as const satisfies readonly InquiryKind[];

export const INQUIRY_KIND_LABEL: Record<InquiryKind, string> = {
  QUESTION: "문의",
  SUGGESTION: "건의",
  BUG: "버그 신고",
};

export const INQUIRY_KIND_TONE: Record<InquiryKind, BadgeTone> = {
  QUESTION: "sky",
  SUGGESTION: "teal",
  BUG: "red",
};

export const MAX_INQUIRY = 2000;

export function validateInquiryContent(content: string): string | null {
  const len = content.trim().length;
  if (len === 0) return "내용을 입력하세요";
  if (len > MAX_INQUIRY) return `내용은 ${MAX_INQUIRY}자 이하로 입력하세요`;
  return null;
}

export function parseInquiryKind(v: string): InquiryKind | null {
  return (INQUIRY_KINDS as readonly string[]).includes(v) ? (v as InquiryKind) : null;
}

/** 운영진이거나, 작성자 본인이고 아직 답변이 없을 때 */
export function canDeleteInquiry(
  user: { id: string; role: string },
  inquiry: { authorId: string; answer: string | null },
): boolean {
  return isAdmin(user) || (inquiry.authorId === user.id && inquiry.answer === null);
}

export type InquiryScope = "ALL" | "MINE" | "UNANSWERED";

export function filterInquiries<T extends { authorId: string; answer: string | null }>(
  items: T[],
  scope: InquiryScope,
  userId: string,
): T[] {
  if (scope === "MINE") return items.filter((i) => i.authorId === userId);
  if (scope === "UNANSWERED") return items.filter((i) => i.answer === null);
  return items;
}
