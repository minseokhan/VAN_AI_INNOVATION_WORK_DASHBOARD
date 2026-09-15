import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { sortProjects } from "@/lib/projects/filter";
import { AssignBoard } from "@/components/assign/AssignBoard";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function AssignPage({ searchParams }: { searchParams: Promise<{ showDone?: string }> }) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") redirect("/");
    throw e; // requireUser의 NEXT_REDIRECT 등은 그대로 전파
  }
  const showDone = (await searchParams).showDone === "1";
  const [users, projects] = await Promise.all([
    db.user.findMany({
      where: { approved: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, _count: { select: { memberships: true } } },
    }),
    db.project.findMany({
      where: showDone ? {} : { status: { not: "DONE" } },
      select: {
        id: true, code: true, title: true, status: true, priority: true,
        members: { select: { userId: true, position: true, user: { select: { name: true } } } },
      },
    }),
  ]);
  return (
    <>
      <PageHeader
        title="배치 보드"
        actions={
          <Link href={showDone ? "/assign" : "/assign?showDone=1"} className="text-sm text-navy-500 hover:underline">
            {showDone ? "완료 프로젝트 숨기기" : "완료 프로젝트 표시"}
          </Link>
        }
      />
      <AssignBoard
        members={users.map((u) => ({ id: u.id, name: u.name, projectCount: u._count.memberships }))}
        projects={sortProjects(projects).map(({ members, ...p }) => ({
          ...p,
          members: members.map((m) => ({ userId: m.userId, name: m.user.name, position: m.position })),
        }))}
      />
    </>
  );
}
