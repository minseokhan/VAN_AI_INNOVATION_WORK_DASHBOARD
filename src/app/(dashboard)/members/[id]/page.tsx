import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { ProfileView } from "@/components/settings/ProfileView";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/projects/labels";
import { formatDate } from "@/lib/utils/date";

export default async function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") redirect("/");
    throw e; // requireUser의 NEXT_REDIRECT 등은 그대로 전파
  }
  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    select: {
      username: true,
      name: true,
      role: true,
      createdAt: true,
      level: true,
      skills: true,
      interests: true,
      bio: true,
      profileLinks: { orderBy: { createdAt: "desc" }, select: { id: true, kind: true, title: true, url: true, createdAt: true } },
      memberships: {
        orderBy: { assignedAt: "desc" },
        select: { project: { select: { id: true, code: true, title: true, status: true } } },
      },
    },
  });
  if (!user) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="멤버 프로필" />
      <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-5">
        <Avatar name={user.name} />
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-slate-900">{user.name}</p>
          <p className="text-xs text-slate-500">
            {user.username} · 가입 {formatDate(user.createdAt)}
          </p>
        </div>
        <Badge tone={user.role === "ADMIN" ? "navy" : "neutral"}>{user.role === "ADMIN" ? "운영진" : "부원"}</Badge>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-5">
        <ProfileView data={user} />
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-5">
        <h2 className="mb-2 text-sm font-semibold text-slate-900">참여 프로젝트 ({user.memberships.length})</h2>
        {user.memberships.length === 0 ? (
          <p className="text-sm text-slate-400">배치된 프로젝트가 없습니다</p>
        ) : (
          <ul className="space-y-2">
            {user.memberships.map(({ project }) => (
              <li key={project.id} className="flex items-center gap-2 text-sm">
                <Badge tone={STATUS_TONE[project.status]}>{STATUS_LABEL[project.status]}</Badge>
                <Link href={`/projects/${project.id}`} className="truncate text-navy-500 hover:underline">
                  {project.code} {project.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link href="/members" className="inline-block text-sm text-navy-500 hover:underline">
        ← 멤버 관리
      </Link>
    </div>
  );
}
