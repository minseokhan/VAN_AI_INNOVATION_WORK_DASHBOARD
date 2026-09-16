type Result = { ok: true } | { ok: false; reason: string };

/** 본인 강등 불가, 마지막 ADMIN 강등 불가, actor가 ADMIN이 아니면 불가 */
export function canChangeRole(
  actor: { id: string; role: string },
  target: { id: string },
  adminCount: number,
  to: "ADMIN" | "MEMBER",
): Result {
  if (actor.role !== "ADMIN") return { ok: false, reason: "운영진만 역할을 변경할 수 있습니다" };
  if (to === "MEMBER") {
    if (actor.id === target.id) return { ok: false, reason: "본인의 운영진 권한은 해제할 수 없습니다" };
    if (adminCount <= 1) return { ok: false, reason: "마지막 운영진은 해제할 수 없습니다" };
  }
  return { ok: true };
}

/** 본인 삭제 불가. 승인된 사용자 삭제 불가(거절은 미승인만) */
export function canRemoveUser(actor: { id: string }, target: { id: string; approved: boolean }): Result {
  if (actor.id === target.id) return { ok: false, reason: "본인 계정은 삭제할 수 없습니다" };
  if (target.approved) return { ok: false, reason: "승인된 사용자는 삭제할 수 없습니다" };
  return { ok: true };
}
