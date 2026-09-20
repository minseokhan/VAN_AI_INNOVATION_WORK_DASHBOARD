import type { ProjectStatus } from "@prisma/client";

/** 새 기능의 order: max+1, 빈 배열이면 0 */
export function nextOrder(features: Array<{ order: number }>): number {
  return features.length === 0 ? 0 : Math.max(...features.map((f) => f.order)) + 1;
}

export function validateFeatureTitle(title: string): string | null {
  const t = title.trim();
  if (t.length === 0) return "기능 이름을 입력하세요";
  if (t.length > 120) return "기능 이름은 120자 이하여야 합니다";
  return null;
}

/** 수동 전이는 IN_PROGRESS ↔ DONE 만. 멤버 0명이면 불가. UNASSIGNED 는 배치로만 바뀐다 */
export function canTransitionStatus(from: ProjectStatus, to: ProjectStatus, memberCount: number): boolean {
  if (memberCount <= 0) return false;
  return (from === "IN_PROGRESS" && to === "DONE") || (from === "DONE" && to === "IN_PROGRESS");
}

/** 기능 체크리스트 입력 항목들 → 기능 제목 배열. 공백 항목은 무시, 첫 오류에서 중단 */
export function parseFeatureList(raw: string[]): { ok: true; titles: string[] } | { ok: false; error: string } {
  const titles = raw.map((s) => s.trim()).filter(Boolean);
  for (const t of titles) {
    const error = validateFeatureTitle(t);
    if (error) return { ok: false, error };
  }
  return { ok: true, titles };
}
