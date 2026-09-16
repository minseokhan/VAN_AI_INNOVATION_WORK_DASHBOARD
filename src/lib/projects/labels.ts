import type { Position, ProjectStatus } from "@prisma/client";
import type { BadgeTone } from "@/components/ui/Badge";

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  UNASSIGNED: "미배정",
  IN_PROGRESS: "진행중",
  DONE: "완료",
};

export const STATUS_TONE: Record<ProjectStatus, BadgeTone> = {
  UNASSIGNED: "amber",
  IN_PROGRESS: "navy",
  DONE: "green",
};

export const POSITION_LABEL: Record<Position, string> = {
  FE: "프론트",
  BE: "백엔드",
  AI: "AI",
  PM: "기획",
  ETC: "기타",
};

export const PRIORITY_ORDER: string[] = ["上", "中上", "中", "中下", "下", "중장기"];

/** 저장값은 한자 그대로, 화면에만 한글로 */
export const PRIORITY_LABEL: Record<string, string> = {
  上: "상", 中上: "중상", 中: "중", 中下: "중하", 下: "하", 중장기: "중장기",
};

export const PRIORITY_TONE: Record<string, BadgeTone> = {
  上: "red", 中上: "orange", 中: "yellow", 中下: "sky", 下: "neutral", 중장기: "teal",
};

/** 목록에 없으면 마지막 순위 */
export function priorityRank(p: string): number {
  const i = PRIORITY_ORDER.indexOf(p);
  return i === -1 ? PRIORITY_ORDER.length : i;
}
