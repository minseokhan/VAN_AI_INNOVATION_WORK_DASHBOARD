import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/guards";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user?.approved) redirect("/");
  return <RegisterForm />;
}
