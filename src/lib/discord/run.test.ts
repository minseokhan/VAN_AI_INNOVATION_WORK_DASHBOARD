import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { findMany, updateMany, sendWebhook } = vi.hoisted(() => ({
  findMany: vi.fn(),
  updateMany: vi.fn(),
  sendWebhook: vi.fn(),
}));
vi.mock("@/lib/db", () => ({ db: { question: { findMany, updateMany } } }));
vi.mock("./webhook", () => ({ sendWebhook }));

import { runDigest } from "./run";

const now = new Date("2026-09-15T09:00:00Z");
const rows = [
  {
    id: "q1", content: "질문", createdAt: now, projectId: "p1",
    author: { name: "홍길동" }, project: { code: "2-1", title: "T" },
  },
];

beforeEach(() => {
  findMany.mockReset().mockResolvedValue(rows);
  updateMany.mockReset().mockResolvedValue({ count: 1 });
  sendWebhook.mockReset().mockResolvedValue(undefined);
  vi.stubEnv("DISCORD_WEBHOOK_URL", "https://discord.com/api/webhooks/x");
  vi.stubEnv("DISCORD_PLANNER_ROLE_ID", "R1");
  vi.stubEnv("APP_BASE_URL", "https://van.example");
});
afterEach(() => vi.unstubAllEnvs());

describe("runDigest", () => {
  it("웹훅 URL 없으면 skipped, DB 접근 없음", async () => {
    vi.stubEnv("DISCORD_WEBHOOK_URL", "");
    expect(await runDigest(now)).toEqual({ sent: 0, skipped: "DISCORD_WEBHOOK_URL 미설정" });
    expect(findMany).not.toHaveBeenCalled();
  });

  it("미발송 질문이 없으면 sent 0, 전송 없음", async () => {
    findMany.mockResolvedValue([]);
    expect(await runDigest(now)).toEqual({ sent: 0 });
    expect(sendWebhook).not.toHaveBeenCalled();
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("sentToDiscordAt null만 조회 → 전송 → 성공 후 sentToDiscordAt 기록", async () => {
    expect(await runDigest(now)).toEqual({ sent: 1 });
    expect(findMany.mock.calls[0][0].where).toEqual({ sentToDiscordAt: null });
    const [url, messages, roleId] = sendWebhook.mock.calls[0];
    expect(url).toBe("https://discord.com/api/webhooks/x");
    expect(messages[0]).toContain("<@&R1>");
    expect(messages[0]).toContain("https://van.example/questions?project=p1");
    expect(roleId).toBe("R1");
    expect(updateMany).toHaveBeenCalledWith({ where: { id: { in: ["q1"] } }, data: { sentToDiscordAt: now } });
  });

  it("전송 실패 시 throw, sentToDiscordAt 미기록", async () => {
    sendWebhook.mockRejectedValue(new Error("webhook 500"));
    await expect(runDigest(now)).rejects.toThrow("webhook 500");
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("APP_BASE_URL 없으면 VERCEL_PROJECT_PRODUCTION_URL 사용", async () => {
    vi.stubEnv("APP_BASE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "van.vercel.app");
    await runDigest(now);
    expect(sendWebhook.mock.calls[0][1][0]).toContain("https://van.vercel.app/questions?project=p1");
  });
});
