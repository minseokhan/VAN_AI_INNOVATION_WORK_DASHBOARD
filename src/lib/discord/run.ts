import { db } from "@/lib/db";
import { formatWeekLabel } from "@/lib/utils/week";
import { buildDigestMessages } from "./digest";
import { buildReminderMessages } from "./remind";
import { sendWebhook } from "./webhook";

/** 미발송 질문을 디스코드로 보내고, 전송이 성공한 뒤에만 sentToDiscordAt을 기록한다. 실패 시 throw(다음 실행에서 재시도) */
export async function runDigest(now: Date = new Date()): Promise<{ sent: number; skipped?: string }> {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return { sent: 0, skipped: "DISCORD_WEBHOOK_URL 미설정" };

  const qs = await db.question.findMany({
    where: { sentToDiscordAt: null },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { name: true } }, project: { select: { code: true, title: true } } },
  });
  if (qs.length === 0) return { sent: 0 };

  const baseUrl = process.env.APP_BASE_URL || `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  const roleId = process.env.DISCORD_PLANNER_ROLE_ID || undefined;
  const messages = buildDigestMessages(
    qs.map((q) => ({
      id: q.id,
      content: q.content,
      createdAt: q.createdAt,
      authorName: q.author.name,
      projectCode: q.project.code,
      projectTitle: q.project.title,
      projectId: q.projectId,
    })),
    { roleId, baseUrl, date: now },
  );
  await sendWebhook(url, messages, roleId);
  await db.question.updateMany({ where: { id: { in: qs.map((q) => q.id) } }, data: { sentToDiscordAt: now } });
  return { sent: qs.length };
}

const DEADLINE = "일요일 23:59";

/** 그 주 주간보고를 내지 않은 진행 중 프로젝트의 배치 멤버에게 독촉 메시지를 보낸다 */
export async function runWeeklyReminder(weekStart: Date): Promise<{ sent: number; skipped?: string }> {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return { sent: 0, skipped: "DISCORD_WEBHOOK_URL 미설정" };

  const projects = await db.project.findMany({
    where: { status: "IN_PROGRESS", weeklyUpdates: { none: { weekStart } } },
    orderBy: { code: "asc" },
    select: { id: true, code: true, title: true, members: { select: { user: { select: { name: true } } } } },
  });

  const baseUrl = process.env.APP_BASE_URL || `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  const messages = buildReminderMessages(
    projects.map((p) => ({
      projectId: p.id,
      projectCode: p.code,
      projectTitle: p.title,
      memberNames: p.members.map((m) => m.user.name),
    })),
    { weekLabel: formatWeekLabel(weekStart), baseUrl, deadline: DEADLINE },
  );
  if (messages.length === 0) return { sent: 0 };

  await sendWebhook(url, messages);
  return { sent: projects.filter((p) => p.members.length > 0).length };
}
