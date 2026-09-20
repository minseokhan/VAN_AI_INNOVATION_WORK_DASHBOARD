"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register, type FormState } from "@/app/(auth)/actions";
import { FormField, primaryButtonClass } from "./FormField";
import { useRetainOnError } from "@/components/ui/useRetainOnError";

export function RegisterForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(register, {});
  const { formRef, submit } = useRetainOnError(action, state);
  const errors = state.fieldErrors ?? {};
  return (
    <form ref={formRef} action={submit} className="space-y-4">
      <h1 className="text-base font-semibold text-slate-900">회원가입</h1>
      <FormField id="name" label="이름" autoComplete="name" error={errors.name} required />
      <FormField
        id="username"
        label="아이디"
        autoComplete="username"
        placeholder="영문 소문자, 숫자, _ (3~20자)"
        error={errors.username}
        required
      />
      <FormField
        id="password"
        label="비밀번호"
        type="password"
        autoComplete="new-password"
        placeholder="8자 이상"
        error={errors.password}
        required
      />
      {state.error && <p className="text-xs text-red-700">{state.error}</p>}
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        가입하기
      </button>
      <p className="text-center text-xs text-slate-500">
        이미 계정이 있나요?{" "}
        <Link href="/login" className="text-navy-500 hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
