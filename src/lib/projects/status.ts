import type { ProjectStatus } from "@prisma/client";

/** 배치 변경 후 상태: 0명 → UNASSIGNED, UNASSIGNED+1명 이상 → IN_PROGRESS, 그 외(DONE 포함) 현재 유지 */
export function deriveStatusAfterAssign(current: ProjectStatus, memberCountAfter: number): ProjectStatus {
  if (memberCountAfter <= 0) return "UNASSIGNED";
  if (current === "UNASSIGNED") return "IN_PROGRESS";
  return current;
}
