import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password", () => {
  it("해시는 평문과 다르고 bcrypt cost 10 형식이다", async () => {
    const hash = await hashPassword("secret123");
    expect(hash).not.toBe("secret123");
    expect(hash.startsWith("$2b$10$") || hash.startsWith("$2a$10$")).toBe(true);
  });

  it("같은 평문은 검증에 성공하고, 다른 평문은 실패한다", async () => {
    const hash = await hashPassword("secret123");
    expect(await verifyPassword("secret123", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});
