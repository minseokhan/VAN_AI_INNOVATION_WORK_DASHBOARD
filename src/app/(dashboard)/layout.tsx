import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const pendingCount = user.role === "ADMIN" ? await db.user.count({ where: { approved: false } }) : 0;
  return (
    <div className="min-h-screen lg:flex">
      <div className="hidden lg:sticky lg:top-0 lg:block lg:h-screen">
        <Sidebar user={user} pendingCount={pendingCount} />
      </div>
      <MobileHeader user={user} pendingCount={pendingCount} />
      <main className="min-w-0 flex-1">
        <div className="max-w-6xl px-6 py-8 animate-[fade-in_200ms_ease-out]">{children}</div>
      </main>
    </div>
  );
}
