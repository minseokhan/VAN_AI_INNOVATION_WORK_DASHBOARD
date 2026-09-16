import { requireUser } from "@/lib/auth/guards";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function DashboardPage() {
  await requireUser();
  return (
    <>
      <PageHeader title="프로젝트" />
      <EmptyState message="프로젝트 목록은 다음 단계에서 표시됩니다" />
    </>
  );
}
