import { formatDate } from "@/lib/utils/date";

export type DigestQuestion = {
  id: string;
  content: string;
  createdAt: Date;
  authorName: string;
  projectCode: string;
  projectTitle: string;
  projectId: string;
};

const LIMIT = 2000;
const CONTENT_MAX = 200;

function oneLine(content: string): string {
  const s = content.replace(/\s*\n\s*/g, " ").trim();
  return s.length > CONTENT_MAX ? `${s.slice(0, CONTENT_MAX)}…` : s;
}

/** 미발송 질문을 프로젝트별로 묶은 디스코드 메시지 목록. 2000자 한도로 분할, 헤더는 첫 메시지에만 */
export function buildDigestMessages(
  qs: DigestQuestion[],
  { roleId, baseUrl, date }: { roleId?: string; baseUrl: string; date: Date },
): string[] {
  if (qs.length === 0) return [];
  const [, m, d] = formatDate(date).split("-");
  const header = `${roleId ? `<@&${roleId}> ` : ""}📋 **AI혁신부 기획 질문 다이제스트 (${Number(m)}/${Number(d)})** — ${qs.length}건`;

  const groups = new Map<string, DigestQuestion[]>();
  for (const q of qs) groups.set(q.projectId, [...(groups.get(q.projectId) ?? []), q]);

  const messages: string[] = [];
  let cur = header;
  const push = (text: string, sep: string) => {
    if (cur && (cur + sep + text).length > LIMIT) {
      messages.push(cur);
      cur = text;
    } else cur = cur ? cur + sep + text : text;
  };
  for (const list of groups.values()) {
    const { projectCode, projectTitle, projectId } = list[0];
    const lines = [`**[${projectCode}] ${projectTitle}** · ${baseUrl}/questions?project=${projectId}`, ...list.map((q) => `• (${q.authorName}) ${oneLine(q.content)}`)];
    const block = lines.join("\n");
    if (block.length <= LIMIT) push(block, "\n\n");
    else lines.forEach((line, i) => push(line, i === 0 ? "\n\n" : "\n")); // 한 프로젝트가 한도를 넘으면 줄 단위로
  }
  messages.push(cur);
  return messages;
}
