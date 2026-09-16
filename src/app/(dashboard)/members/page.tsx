import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function MembersPage() {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") redirect("/");
    throw e; // requireUser의 NEXT_REDIRECT 등은 그대로 전파
  }
  return (
    <>
      <PageHeader title="멤버 관리" />
      <EmptyState message="멤버 목록은 다음 단계에서 표시됩니다" />
    </>
  );
}
