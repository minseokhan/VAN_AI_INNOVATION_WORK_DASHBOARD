import { requireUser } from "@/lib/auth/guards";
import { logout } from "./(auth)/actions";

// 임시 페이지 — 대시보드는 phase 2-layout에서 교체
export default async function Home() {
  const user = await requireUser();
  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">VAN AI 혁신부 대시보드</h1>
      <p className="mt-2 text-sm text-slate-700">{user.name}님, 환영합니다.</p>
      <form action={logout} className="mt-6">
        <button type="submit" className="text-sm text-navy-500 hover:underline">
          로그아웃
        </button>
      </form>
    </main>
  );
}
