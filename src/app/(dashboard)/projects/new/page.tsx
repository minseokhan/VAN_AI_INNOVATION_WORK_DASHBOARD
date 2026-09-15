import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { createProject } from "../actions";

export default async function NewProjectPage() {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") redirect("/");
    throw e; // requireUser의 NEXT_REDIRECT 등은 그대로 전파
  }
  const categories = (await db.project.findMany({ distinct: ["category"], select: { category: true }, orderBy: { category: "asc" } })).map(
    (c) => c.category,
  );
  return (
    <>
      <PageHeader title="새 프로젝트" />
      <ProjectForm action={createProject} categories={categories} submitLabel="생성" />
    </>
  );
}
