import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { formatDate } from "@/lib/utils/date";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { deleteProject, updateProject } from "../../actions";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") redirect("/");
    throw e; // requireUser의 NEXT_REDIRECT 등은 그대로 전파
  }
  const { id } = await params;
  const [project, rows] = await Promise.all([
    db.project.findUnique({ where: { id } }),
    db.project.findMany({ distinct: ["category"], select: { category: true }, orderBy: { category: "asc" } }),
  ]);
  if (!project) notFound();
  return (
    <>
      <PageHeader title={`편집: ${project.title}`} />
      <ProjectForm
        action={updateProject.bind(null, id)}
        categories={rows.map((c) => c.category)}
        submitLabel="저장"
        defaultValues={{ ...project, dueDate: project.dueDate ? formatDate(project.dueDate) : "" }}
        cancelHref={`/projects/${id}`}
        extraActions={
          <ConfirmButton
            label="프로젝트 삭제"
            confirmLabel="삭제 확인"
            message="정말 삭제하시겠습니까? 기능·보고·질문이 모두 삭제됩니다"
            onConfirm={deleteProject.bind(null, id)}
          />
        }
      />
    </>
  );
}
