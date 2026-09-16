import { beforeEach, describe, expect, it } from "vitest";
import { SignJWT } from "jose";
import { SESSION_COOKIE, signSession, verifySession, type SessionUser } from "./session";

const user: SessionUser = { id: "u1", username: "alice", name: "앨리스", role: "MEMBER", approved: false };

beforeEach(() => {
  process.env.JWT_SECRET = "test-secret-at-least-16-chars";
});

describe("session", () => {
  it("쿠키 이름은 van_session", () => {
    expect(SESSION_COOKIE).toBe("van_session");
  });

  it("서명한 토큰은 검증 시 동일한 사용자 정보를 돌려준다", async () => {
    const token = await signSession(user);
    expect(await verifySession(token)).toEqual(user);
  });

  it("SessionUser 외의 필드는 토큰에 담기지 않는다", async () => {
    const token = await signSession({ ...user, passwordHash: "hash" } as SessionUser);
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    expect(payload.passwordHash).toBeUndefined();
    expect(payload.exp - payload.iat).toBe(7 * 24 * 60 * 60);
  });

  it("undefined·빈 문자열·쓰레기 토큰은 null", async () => {
    expect(await verifySession(undefined)).toBeNull();
    expect(await verifySession("")).toBeNull();
    expect(await verifySession("not.a.jwt")).toBeNull();
  });

  it("만료된 토큰은 null", async () => {
    const token = await new SignJWT({ ...user })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));
    expect(await verifySession(token)).toBeNull();
  });

  it("다른 시크릿으로 서명한 위조 토큰은 null", async () => {
    const token = await new SignJWT({ ...user })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(new TextEncoder().encode("another-secret-16-chars-long"));
    expect(await verifySession(token)).toBeNull();
  });

  it("JWT_SECRET이 없거나 16자 미만이면 throw", async () => {
    delete process.env.JWT_SECRET;
    await expect(signSession(user)).rejects.toThrow();
    process.env.JWT_SECRET = "short";
    await expect(signSession(user)).rejects.toThrow();
  });
});
