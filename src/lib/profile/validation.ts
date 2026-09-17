import type { SkillLevel } from "@prisma/client";

export const LEVELS = ["BEGINNER", "NOVICE", "INTERMEDIATE", "ADVANCED"] as const satisfies readonly SkillLevel[];

export const LEVEL_LABEL: Record<SkillLevel, string> = {
  BEGINNER: "입문",
  NOVICE: "초급",
  INTERMEDIATE: "중급",
  ADVANCED: "고급",
};

/** 수준을 서로 비교할 수 있도록 기준을 문장으로 고정한다 */
export const LEVEL_HINT: Record<SkillLevel, string> = {
  BEGINNER: "튜토리얼을 따라 만들어 본 단계",
  NOVICE: "도움을 받으면 기능 하나를 만들 수 있다",
  INTERMEDIATE: "혼자 기능 단위를 설계하고 구현할 수 있다",
  ADVANCED: "서비스 하나를 설계·배포까지 끌고 갈 수 있다",
};

export const MAX_PROFILE = { skills: 500, interests: 300, bio: 2000 };

export type ProfileInput = { level: string; skills: string; interests: string; bio: string };
export type ProfileValue = { level: SkillLevel | null; skills: string | null; interests: string | null; bio: string | null };
export type ProfileResult = { ok: true; value: ProfileValue } | { ok: false; errors: Partial<Record<keyof ProfileInput, string>> };

function text(v: string, max: number, label: string): [string | null, string | undefined] {
  const t = v.trim();
  if (t.length > max) return [null, `${label}은(는) ${max}자 이하여야 합니다`];
  return [t || null, undefined];
}

export function validateProfile(input: ProfileInput): ProfileResult {
  const errors: Partial<Record<keyof ProfileInput, string>> = {};
  const level = input.level.trim();
  if (level && !(LEVELS as readonly string[]).includes(level)) errors.level = "수준 값이 올바르지 않습니다";

  const [skills, skillsErr] = text(input.skills, MAX_PROFILE.skills, "구현할 수 있는 것");
  const [interests, interestsErr] = text(input.interests, MAX_PROFILE.interests, "관심 분야");
  const [bio, bioErr] = text(input.bio, MAX_PROFILE.bio, "소개");
  if (skillsErr) errors.skills = skillsErr;
  if (interestsErr) errors.interests = interestsErr;
  if (bioErr) errors.bio = bioErr;

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { level: (level || null) as SkillLevel | null, skills, interests, bio } };
}
