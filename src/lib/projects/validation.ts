import { PRIORITY_ORDER } from "./labels";

export type ProjectInput = {
  code: string;
  title: string;
  category: string;
  priority: string;
  summary: string;
  description: string;
  dueDate?: string;
};

const CODE_RE = /^\d+(-\d+)?$/;
const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export function validateProject(
  input: ProjectInput,
): { ok: true; value: ProjectInput } | { ok: false; errors: Partial<Record<keyof ProjectInput, string>> } {
  const errors: Partial<Record<keyof ProjectInput, string>> = {};
  const len = (s: string, min: number, max: number) => s.length >= min && s.length <= max;
  if (!CODE_RE.test(input.code)) errors.code = "과제 번호는 '2' 또는 '2-1' 형식이어야 합니다";
  if (!len(input.title, 1, 80)) errors.title = "제목은 1~80자여야 합니다";
  if (!len(input.category, 1, 30)) errors.category = "분야는 1~30자여야 합니다";
  if (!PRIORITY_ORDER.includes(input.priority)) errors.priority = "우선순위를 선택하세요";
  if (!len(input.summary, 1, 200)) errors.summary = "한 줄 요약은 1~200자여야 합니다";
  if (!len(input.description, 0, 5000)) errors.description = "상세 설명은 5000자 이하여야 합니다";
  if (input.dueDate && !DATE_RE.test(input.dueDate)) errors.dueDate = "마감일은 YYYY-MM-DD 형식이어야 합니다";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value: input };
}

export function parseProjectForm(fd: FormData): ProjectInput {
  const get = (k: string) => String(fd.get(k) ?? "").trim();
  return {
    code: get("code"),
    title: get("title"),
    category: get("category"),
    priority: get("priority"),
    summary: get("summary"),
    description: get("description"),
    dueDate: get("dueDate"),
  };
}
