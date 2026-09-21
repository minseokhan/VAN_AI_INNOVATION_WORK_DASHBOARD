import { describe, expect, it } from "vitest";
import { POSITIONS } from "@/lib/projects/labels";
import { LEVELS, LEVEL_LABEL, MAX_PROFILE, validateProfile } from "./validation";

const empty = { level: "", preferredPosition: "", tools: "", skills: "", interests: "", bio: "" };

describe("validateProfile", () => {
  it("빈 입력은 모두 null로 저장된다", () => {
    expect(validateProfile(empty)).toEqual({ ok: true, value: { level: null, preferredPosition: null, tools: null, skills: null, interests: null, bio: null } });
  });

  it("공백만 있는 값도 null", () => {
    const r = validateProfile({ ...empty, skills: "   \n  " });
    expect(r).toEqual({ ok: true, value: { level: null, preferredPosition: null, tools: null, skills: null, interests: null, bio: null } });
  });

  it("정상 입력은 trim 후 그대로", () => {
    const r = validateProfile({
      level: "INTERMEDIATE",
      preferredPosition: "FE",
      tools: " TypeScript, Figma ",
      skills: " Next.js ",
      interests: "AI 에이전트",
      bio: "블로그: https://a.b",
    });
    expect(r).toEqual({
      ok: true,
      value: { level: "INTERMEDIATE", preferredPosition: "FE", tools: "TypeScript, Figma", skills: "Next.js", interests: "AI 에이전트", bio: "블로그: https://a.b" },
    });
  });

  it("모든 레벨 값이 허용된다", () => {
    for (const level of LEVELS) {
      const r = validateProfile({ ...empty, level });
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value.level).toBe(level);
      expect(LEVEL_LABEL[level]).toBeTruthy();
    }
  });

  it("목록에 없는 레벨은 거부", () => {
    const r = validateProfile({ ...empty, level: "GOD" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.level).toBeTruthy();
  });

  it("길이 제한을 넘으면 필드별 에러", () => {
    const r = validateProfile({
      ...empty,
      tools: "a".repeat(MAX_PROFILE.tools + 1),
      skills: "a".repeat(MAX_PROFILE.skills + 1),
      interests: "a".repeat(MAX_PROFILE.interests + 1),
      bio: "a".repeat(MAX_PROFILE.bio + 1),
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["bio", "interests", "skills", "tools"]);
  });

  it("모든 포지션 값이 허용된다", () => {
    for (const pos of POSITIONS) {
      const r = validateProfile({ ...empty, preferredPosition: pos });
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value.preferredPosition).toBe(pos);
    }
  });

  it("목록에 없는 포지션은 거부", () => {
    const r = validateProfile({ ...empty, preferredPosition: "DEVOPS" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.preferredPosition).toBeTruthy();
  });

  it("경계값은 통과", () => {
    expect(validateProfile({ ...empty, bio: "a".repeat(MAX_PROFILE.bio) }).ok).toBe(true);
  });
});
