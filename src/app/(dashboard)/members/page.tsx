import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { MemberRow, PendingRow } from "@/components/members/MemberRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

const th = "px-3 py-2 text-left text-xs font-medium text-slate-600";

export default async function MembersPage() {
  let me;
  try {
    me = await requireAdmin();
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") redirect("/");
    throw e; // requireUser의 NEXT_REDIRECT 등은 그대로 전파
  }
  const users = await db.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true, username: true, name: true, role: true, adminType: true, approved: true, createdAt: true,
      _count: { select: { memberships: true } },
    },
  });
  const pending = users.filter((u) => !u.approved);
  const members = users.filter((u) => u.approved);
  const adminCount = members.filter((u) => u.role === "ADMIN").length;

  return (
    <div className="space-y-8">
      <PageHeader title="멤버 관리" />
      {pending.length > 0 && (
        <section className="rounded-md border border-amber-300 p-5">
          <h2 className="mb-1 text-sm font-semibold text-slate-900">승인 대기 ({pending.length})</h2>
          <ul className="divide-y divide-slate-100">
            {pending.map((u) => (
              <PendingRow key={u.id} user={u} />
            ))}
          </ul>
        </section>
      )}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">멤버 ({members.length})</h2>
        {members.length === 0 ? (
          <EmptyState message="승인된 멤버가 없습니다" />
        ) : (
          <div className="overflow-x-auto rounded-md border border-slate-200">
            <table className="w-full min-w-[640px]">
              <thead className="bg-navy-50">
                <tr>
                  <th className={th}>이름</th>
                  <th className={th}>아이디</th>
                  <th className={th}>역할</th>
                  <th className={th}>운영진 구분</th>
                  <th className={th}>참여 프로젝트</th>
                  <th className={`${th} text-right`}>액션</th>
                </tr>
              </thead>
              <tbody>
                {members.map((u) => (
                  <MemberRow
                    key={u.id}
                    user={{ ...u, projectCount: u._count.memberships }}
                    isSelf={u.id === me.id}
                    adminCount={adminCount}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
