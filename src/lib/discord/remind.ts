const LIMIT = 2000;

export type MissingReport = {
  projectId: string;
  projectCode: string;
  projectTitle: string;
  memberNames: string[];
};

export type ReminderOptions = { weekLabel: string; baseUrl: string; deadline: string };

/**
 * 주간보고 미제출 팀에게 보낼 디스코드 메시지. 2000자 한도로 분할하고 헤더는 첫 메시지에만.
 * 멘션은 이름 텍스트 — 실제 핑은 Discord 사용자 ID가 있어야 한다.
 */
export function buildReminderMessages(missing: MissingReport[], { weekLabel, baseUrl, deadline }: ReminderOptions): string[] {
  const targets = missing.filter((m) => m.memberNames.length > 0);
  if (targets.length === 0) return [];

  const messages: string[] = [];
  let cur = `⏰ **주간보고 미제출 안내 — ${weekLabel}** · ${targets.length}팀`;
  const push = (text: string, sep: string) => {
    if (cur && (cur + sep + text).length > LIMIT) {
      messages.push(cur);
      cur = text;
    } else cur = cur ? cur + sep + text : text;
  };

  for (const m of targets) {
    const mentions = m.memberNames.map((n) => `@${n}`).join(" ");
    push(
      `${mentions} 님 **[${m.projectCode}] ${m.projectTitle}** 주간보고가 아직 미제출 상태입니다. ${deadline}까지 제출해주시면 감사하겠습니다.\n${baseUrl}/projects/${m.projectId}`,
      "\n\n",
    );
  }
  messages.push(cur);
  return messages;
}
