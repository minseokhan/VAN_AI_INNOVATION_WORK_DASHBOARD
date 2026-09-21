import { describe, expect, it } from "vitest";
import { canChangeRole, canRemoveUser } from "./rules";

const admin = { id: "a1", role: "ADMIN" };
const member = { id: "m1", role: "MEMBER" };

describe("canChangeRole", () => {
  it("ADMIN이 다른 사용자를 운영진으로 지정할 수 있다", () => {
    expect(canChangeRole(admin, { id: "m1" }, 1, "ADMIN")).toEqual({ ok: true });
  });

  it("ADMIN이 다른 운영진을 해제할 수 있다 (운영진이 2명 이상)", () => {
    expect(canChangeRole(admin, { id: "a2" }, 2, "MEMBER")).toEqual({ ok: true });
  });

  it("actor가 ADMIN이 아니면 불가", () => {
    const r = canChangeRole(member, { id: "m2" }, 1, "ADMIN");
    expect(r.ok).toBe(false);
  });

  it("본인 강등 불가", () => {
    const r = canChangeRole(admin, { id: "a1" }, 5, "MEMBER");
    expect(r).toEqual({ ok: false, reason: expect.stringContaining("본인") });
  });

  it("마지막 ADMIN 강등 불가", () => {
    const r = canChangeRole(admin, { id: "a2" }, 1, "MEMBER");
    expect(r).toEqual({ ok: false, reason: expect.stringContaining("마지막") });
  });

  it("본인을 ADMIN으로 다시 지정하는 것은 무해하므로 허용", () => {
    expect(canChangeRole(admin, { id: "a1" }, 1, "ADMIN")).toEqual({ ok: true });
  });
});

describe("canRemoveUser", () => {
  it("미승인 사용자는 거절(삭제)할 수 있다", () => {
    expect(canRemoveUser(admin, { id: "u1", approved: false })).toEqual({ ok: true });
  });

  it("본인 삭제 불가", () => {
    const r = canRemoveUser(admin, { id: "a1", approved: false });
    expect(r).toEqual({ ok: false, reason: expect.stringContaining("본인") });
  });

  it("승인된 사용자 삭제 불가", () => {
    const r = canRemoveUser(admin, { id: "u1", approved: true });
    expect(r).toEqual({ ok: false, reason: expect.stringContaining("승인") });
  });
});
