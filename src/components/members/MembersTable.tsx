"use client";

import { useState } from "react";
import { MemberPanel } from "@/components/members/MemberPanel";
import { MemberRow, type Member } from "@/components/members/MemberRow";

const th = "px-3 py-2 text-left text-xs font-medium text-slate-600";

export function MembersTable({ members, meId, adminCount }: { members: Member[]; meId: string; adminCount: number }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <>
      <div className="overflow-x-auto rounded-md border border-slate-200">
        <table className="w-full min-w-[640px]">
          <thead className="bg-navy-50">
            <tr>
              <th className={th}>이름</th>
              <th className={th}>아이디</th>
              <th className={th}>역할</th>
              <th className={th}>수준</th>
              <th className={th}>참여 프로젝트</th>
              <th className={th}>
                <span className="sr-only">상세</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((u) => (
              <MemberRow key={u.id} user={u} isSelf={u.id === meId} onOpen={() => setOpenId(u.id)} />
            ))}
          </tbody>
        </table>
      </div>
      {openId && (
        <MemberPanel userId={openId} isSelf={openId === meId} adminCount={adminCount} onClose={() => setOpenId(null)} />
      )}
    </>
  );
}
