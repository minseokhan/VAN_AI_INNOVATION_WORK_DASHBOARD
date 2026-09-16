import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { formatDate } from "@/lib/utils/date";
import { DeleteProjectButton } from "@/components/projects/DeleteProjectButton";
import { ProjectForm } from "@/components/projects/ProjectForm";
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
      />
      <section className="mt-12 max-w-2xl rounded-md border border-red-200 p-4">
        <h2 className="mb-3 text-sm font-semibold text-red-700">위험 구역</h2>
        <DeleteProjectButton action={deleteProject.bind(null, id)} />
      </section>
    </>
  );
}
