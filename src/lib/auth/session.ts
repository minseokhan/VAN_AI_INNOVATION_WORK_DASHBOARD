import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "van_session";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 초

export type SessionUser = {
  id: string;
  username: string;
  name: string;
  role: "ADMIN" | "MEMBER";
  approved: boolean;
};

function secret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) throw new Error("JWT_SECRET must be set and at least 16 characters");
  return new TextEncoder().encode(s);
}

export async function signSession(user: SessionUser): Promise<string> {
  const { id, username, name, role, approved } = user;
  return new SignJWT({ id, username, name, role, approved })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());
}

export async function verifySession(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  const key = secret();
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    const { id, username, name, role, approved } = payload as Partial<SessionUser>;
    if (typeof id !== "string" || typeof username !== "string" || typeof name !== "string") return null;
    if (role !== "ADMIN" && role !== "MEMBER") return null;
    return { id, username, name, role, approved: approved === true };
  } catch {
    return null;
  }
}
