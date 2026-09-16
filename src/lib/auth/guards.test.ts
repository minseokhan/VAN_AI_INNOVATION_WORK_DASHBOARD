import { beforeEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { signSession, type SessionUser } from "./session";
import { getSessionUser, requireAdmin, requireUser } from "./guards";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));
vi.mock("@/lib/db", () => ({ db: { user: { findUnique: vi.fn() } } }));

const member: SessionUser = { id: "u1", username: "alice", name: "앨리스", role: "MEMBER", approved: true };
const findUnique = vi.mocked(db.user.findUnique);

async function setCookie(token: string | undefined) {
  vi.mocked(cookies).mockResolvedValue({
    get: (name: string) => (name === "van_session" && token ? { name, value: token } : undefined),
  } as unknown as Awaited<ReturnType<typeof cookies>>);
}

beforeEach(() => {
  process.env.JWT_SECRET = "test-secret-at-least-16-chars";
  vi.clearAllMocks();
});

describe("getSessionUser", () => {
  it("쿠키가 없으면 null이고 DB를 조회하지 않는다", async () => {
    await setCookie(undefined);
    expect(await getSessionUser()).toBeNull();
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("유효한 토큰이면 DB의 최신 role/approved를 반영한다", async () => {
    await setCookie(await signSession(member));
    findUnique.mockResolvedValue({ ...member, role: "ADMIN", approved: false } as never);
    expect(await getSessionUser()).toEqual({ ...member, role: "ADMIN", approved: false });
    expect(findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "u1" } }));
  });

  it("DB에 사용자가 없으면 null", async () => {
    await setCookie(await signSession(member));
    findUnique.mockResolvedValue(null);
    expect(await getSessionUser()).toBeNull();
  });
});

describe("requireUser", () => {
  it("세션 없으면 /login으로 redirect", async () => {
    await setCookie(undefined);
    await expect(requireUser()).rejects.toThrow("REDIRECT:/login");
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("미승인이면 /pending으로 redirect", async () => {
    await setCookie(await signSession(member));
    findUnique.mockResolvedValue({ ...member, approved: false } as never);
    await expect(requireUser()).rejects.toThrow("REDIRECT:/pending");
  });

  it("승인된 사용자를 반환", async () => {
    await setCookie(await signSession(member));
    findUnique.mockResolvedValue(member as never);
    expect(await requireUser()).toEqual(member);
  });
});

describe("requireAdmin", () => {
  it("MEMBER면 FORBIDDEN throw", async () => {
    await setCookie(await signSession(member));
    findUnique.mockResolvedValue(member as never);
    await expect(requireAdmin()).rejects.toThrow("FORBIDDEN");
  });

  it("ADMIN이면 반환", async () => {
    const admin = { ...member, role: "ADMIN" as const };
    await setCookie(await signSession(admin));
    findUnique.mockResolvedValue(admin as never);
    expect(await requireAdmin()).toEqual(admin);
  });
});
