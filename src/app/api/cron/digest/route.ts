import { NextResponse } from "next/server";
import { runDigest } from "@/lib/discord/run";

export const dynamic = "force-dynamic";

/** Vercel Cron이 `Authorization: Bearer ${CRON_SECRET}`를 붙여 호출. 시크릿 미설정·불일치는 401 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await runDigest());
}
