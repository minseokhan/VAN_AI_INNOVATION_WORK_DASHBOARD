import { describe, expect, it } from "vitest";
import { validateRegister } from "./validation";

const valid = { username: "alice_01", password: "password1", name: "앨리스" };

describe("validateRegister", () => {
  it("정상 입력은 ok", () => {
    expect(validateRegister(valid)).toEqual({ ok: true });
  });

  it("username: 3~20자, [a-z0-9_]만 허용", () => {
    for (const username of ["ab", "a".repeat(21), "Alice", "al ice", "al-ice", "한글아이디"]) {
      const r = validateRegister({ ...valid, username });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.errors.username).toMatch(/아이디/);
    }
    expect(validateRegister({ ...valid, username: "abc" }).ok).toBe(true);
    expect(validateRegister({ ...valid, username: "a".repeat(20) }).ok).toBe(true);
  });

  it("password: 8자 이상", () => {
    const r = validateRegister({ ...valid, password: "1234567" });
    expect(r).toEqual({ ok: false, errors: { password: expect.stringMatching(/비밀번호/) } });
    expect(validateRegister({ ...valid, password: "12345678" }).ok).toBe(true);
  });

  it("name: trim 후 1~20자", () => {
    expect(validateRegister({ ...valid, name: "   " }).ok).toBe(false);
    expect(validateRegister({ ...valid, name: "가".repeat(21) }).ok).toBe(false);
    expect(validateRegister({ ...valid, name: "  앨리스  " }).ok).toBe(true);
  });

  it("여러 필드가 틀리면 필드별 에러를 모두 돌려준다", () => {
    const r = validateRegister({ username: "", password: "", name: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["name", "password", "username"]);
  });
});
