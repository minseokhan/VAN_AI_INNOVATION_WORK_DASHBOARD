export const MAX_NOTICE = { title: 100, content: 10000 };

export type NoticeInput = { title: string; content: string };
export type NoticeResult =
  | { ok: true; value: NoticeInput }
  | { ok: false; errors: Partial<Record<keyof NoticeInput, string>> };

function field(v: string, max: number, label: string): [string, string | undefined] {
  const t = v.trim();
  if (t.length === 0) return [t, `${label}을 입력하세요`];
  if (t.length > max) return [t, `${label}은 ${max}자 이하로 입력하세요`];
  return [t, undefined];
}

export function validateNotice(input: NoticeInput): NoticeResult {
  const [title, titleErr] = field(input.title, MAX_NOTICE.title, "제목");
  const [content, contentErr] = field(input.content, MAX_NOTICE.content, "내용");
  const errors: Partial<Record<keyof NoticeInput, string>> = {};
  if (titleErr) errors.title = titleErr;
  if (contentErr) errors.content = contentErr;
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { title, content } };
}
