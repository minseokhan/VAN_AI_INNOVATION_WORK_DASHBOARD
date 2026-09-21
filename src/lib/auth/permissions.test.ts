import { describe, expect, it } from "vitest";
import { canEditProject, isAdmin } from "./permissions";

describe("permissions", () => {
  it("isAdmin은 role이 ADMIN일 때만 true", () => {
    expect(isAdmin({ role: "ADMIN" })).toBe(true);
    expect(isAdmin({ role: "MEMBER" })).toBe(false);
  });

  it("canEditProject: 팀원 또는 ADMIN", () => {
    expect(canEditProject({ id: "u1", role: "MEMBER" }, ["u1", "u2"])).toBe(true);
    expect(canEditProject({ id: "u3", role: "MEMBER" }, ["u1", "u2"])).toBe(false);
    expect(canEditProject({ id: "u3", role: "ADMIN" }, ["u1", "u2"])).toBe(true);
    expect(canEditProject({ id: "u3", role: "MEMBER" }, [])).toBe(false);
  });
});
