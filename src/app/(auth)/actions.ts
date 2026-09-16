"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/guards";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, type SessionUser } from "@/lib/auth/session";
import { validateRegister } from "@/lib/auth/validation";

export type FormState = { error?: string; fieldErrors?: Record<string, string> };

async function setSessionCookie(user: SessionUser) {
  (await cookies()).set(SESSION_COOKIE, await signSession(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

/** 오픈 리다이렉트 방지: 같은 사이트의 절대 경로만 허용 */
function safeNext(next: string) {
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const username = field(formData, "username").trim();
  const password = field(formData, "password");
  const user = await db.user.findUnique({ where: { username } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "아이디 또는 비밀번호가 올바르지 않습니다" };
  }
  await setSessionCookie(user);
  redirect(user.approved ? safeNext(field(formData, "next")) : "/pending");
}

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const input = {
    username: field(formData, "username").trim(),
    password: field(formData, "password"),
    name: field(formData, "name").trim(),
  };
  const result = validateRegister(input);
  if (!result.ok) return { fieldErrors: result.errors };
  if (await db.user.findUnique({ where: { username: input.username }, select: { id: true } })) {
    return { fieldErrors: { username: "이미 사용 중인 아이디입니다" } };
  }
  const user = await db.user.create({
    data: { username: input.username, name: input.name, passwordHash: await hashPassword(input.password), approved: false },
  });
  await setSessionCookie(user);
  redirect("/pending");
}

export async function logout(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}

/** 승인 후 새 토큰 발급 — Server Component에서는 쿠키를 쓸 수 없어 /pending의 폼 액션으로 호출한다. */
export async function refreshSession(): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  await setSessionCookie(user);
  redirect(user.approved ? "/" : "/pending");
}
