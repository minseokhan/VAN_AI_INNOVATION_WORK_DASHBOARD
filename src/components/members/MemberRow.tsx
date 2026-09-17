"use client";

import { useState, useTransition } from "react";
import { approveUser, rejectUser, setRole } from "@/app/(dashboard)/members/actions";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { formatDate } from "@/lib/utils/date";

type Member = {
  id: string;
  username: string;
  name: string;
  role: "ADMIN" | "MEMBER";
  createdAt: Date;
  projectCount: number;
};

function useAction() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const run = (fn: () => Promise<{ error?: string }>) =>
    startTransition(async () => {
      const res = await fn();
      setError(res.error ?? null);
    });
  return { error, pending, run };
}

const errorText = "mt-1 text-xs text-red-700";

export function PendingCard({ user }: { user: Pick<Member, "id" | "username" | "name" | "createdAt"> }) {
  const { error, pending, run } = useAction();
  return (
    <li className="rounded-md border border-navy-100 bg-white p-4">
      <div className="flex items-center gap-3">
        <Avatar name={user.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
          <p className="truncate text-xs text-slate-500">
            {user.username} · 가입 {formatDate(user.createdAt)}
          </p>
        </div>
      </div>
      {error && <p className={errorText}>{error}</p>}
      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" disabled={pending} onClick={() => run(() => approveUser(user.id))}>
          승인
        </Button>
        <ConfirmButton
          label="거절"
          confirmLabel="거절 확인"
          message="가입 요청을 삭제합니다"
          size="sm"
          onConfirm={() => run(() => rejectUser(user.id))}
        />
      </div>
    </li>
  );
}

export function MemberRow({ user, isSelf, adminCount }: { user: Member; isSelf: boolean; adminCount: number }) {
  const { error, pending, run } = useAction();
  const isAdmin = user.role === "ADMIN";
  const canDemote = !isSelf && adminCount > 1;
  return (
    <>
      <tr className="border-b border-slate-100">
        <td className="px-3 py-2">
          <span className="inline-flex items-center gap-2 text-sm text-slate-900">
            <Avatar name={user.name} />
            {user.name}
            {isSelf && <span className="text-xs text-slate-500">(나)</span>}
          </span>
        </td>
        <td className="px-3 py-2 text-sm text-slate-700">{user.username}</td>
        <td className="px-3 py-2">
          <Badge tone={isAdmin ? "navy" : "neutral"}>{isAdmin ? "운영진" : "부원"}</Badge>
        </td>
        <td className="px-3 py-2 text-sm tabular-nums text-slate-700">{user.projectCount}</td>
        <td className="px-3 py-2">
          {isAdmin ? (
            <Button variant="secondary" size="sm" disabled={pending || !canDemote} onClick={() => run(() => setRole(user.id, "MEMBER"))}>
              운영진 해제
            </Button>
          ) : (
            <Button variant="secondary" size="sm" disabled={pending || isSelf} onClick={() => run(() => setRole(user.id, "ADMIN"))}>
              운영진 지정
            </Button>
          )}
        </td>
      </tr>
      {error && (
        <tr>
          <td colSpan={5} className="px-3 pb-2">
            <p className="text-xs text-red-700">{error}</p>
          </td>
        </tr>
      )}
    </>
  );
}
