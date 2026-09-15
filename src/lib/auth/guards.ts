import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SESSION_COOKIE, verifySession, type SessionUser } from "./session";

/** 쿠키의 JWT를 검증한 뒤 DB에서 최신 role/approved를 다시 읽는다. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  if (!session) return null;
  return db.user.findUnique({
    where: { id: session.id },
    select: { id: true, username: true, name: true, role: true, approved: true },
  });
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!user.approved) redirect("/pending");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}
