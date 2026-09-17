"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { runWeeklyReminder } from "@/lib/discord/run";
import { parseWeekParam } from "@/lib/reports/weekly";

const NOTE_MAX = 4000;

/** 주차별 운영진 총평. 빈 내용이면 지운다 */
export async function saveReportNote(week: string, content: string): Promise<{ error?: string }> {
  const user = await requireAdmin();
  const weekStart = parseWeekParam(week);
  const text = content.trim();
  if (text.length > NOTE_MAX) return { error: `메모는 ${NOTE_MAX}자 이하여야 합니다` };

  if (text) {
    await db.reportNote.upsert({
      where: { weekStart },
      create: { weekStart, authorId: user.id, content: text },
      update: { authorId: user.id, content: text },
    });
  } else {
    await db.reportNote.deleteMany({ where: { weekStart } });
  }
  revalidatePath("/reports");
  return {};
}

export async function sendReminder(week: string): Promise<{ sent?: number; error?: string }> {
  await requireAdmin();
  try {
    const r = await runWeeklyReminder(parseWeekParam(week));
    return r.skipped ? { error: r.skipped } : { sent: r.sent };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "전송에 실패했습니다" };
  }
}
