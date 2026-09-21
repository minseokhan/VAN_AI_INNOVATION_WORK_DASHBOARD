import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/guards";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const user = await getSessionUser();
  if (user?.approved) redirect("/");
  const { next } = await searchParams;
  return <LoginForm next={next} />;
}
