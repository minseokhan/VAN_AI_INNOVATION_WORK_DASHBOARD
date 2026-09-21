import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/guards";
import { logout, refreshSession } from "../actions";
import { primaryButtonClass } from "@/components/auth/FormField";

export default async function PendingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  if (user.approved) {
    return (
      <form action={refreshSession} className="space-y-4">
        <h1 className="text-base font-semibold text-slate-900">승인이 완료되었습니다</h1>
        <p className="text-sm text-slate-700">{user.name}님, 이제 대시보드를 사용할 수 있습니다.</p>
        <button type="submit" className={primaryButtonClass}>
          대시보드로 이동
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-base font-semibold text-slate-900">운영진 승인을 기다리는 중입니다</h1>
      <p className="text-sm text-slate-700">
        {user.name}님, 가입이 접수되었습니다. 운영진이 승인하면 대시보드를 사용할 수 있습니다.
      </p>
      <form action={logout}>
        <button
          type="submit"
          className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500"
        >
          로그아웃
        </button>
      </form>
    </div>
  );
}
