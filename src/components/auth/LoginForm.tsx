"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type FormState } from "@/app/(auth)/actions";
import { FormField, primaryButtonClass } from "./FormField";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});
  return (
    <form action={action} className="space-y-4">
      <h1 className="text-base font-semibold text-slate-900">로그인</h1>
      {next && <input type="hidden" name="next" value={next} />}
      <FormField id="username" label="아이디" autoComplete="username" required />
      <FormField id="password" label="비밀번호" type="password" autoComplete="current-password" required />
      {state.error && <p className="text-xs text-red-700">{state.error}</p>}
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        로그인
      </button>
      <p className="text-center text-xs text-slate-500">
        계정이 없나요?{" "}
        <Link href="/register" className="text-navy-500 hover:underline">
          회원가입
        </Link>
      </p>
    </form>
  );
}
