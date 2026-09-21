"use client";

import type { SkillLevel } from "@prisma/client";
import { useActionState } from "react";
import { changePassword, updateAccount, updateProfile, type FormState } from "@/app/(dashboard)/settings/actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useRetainOnError } from "@/components/ui/useRetainOnError";
import { LEVELS, LEVEL_HINT, LEVEL_LABEL, MAX_PROFILE } from "@/lib/profile/validation";

function SaveRow({ state, pending, label = "저장" }: { state: FormState; pending: boolean; label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "저장 중…" : label}
      </Button>
      {state.ok && <span className="text-xs text-green-700">저장되었습니다</span>}
      {state.error && <span className="text-xs text-red-700">{state.error}</span>}
    </div>
  );
}

export function AccountForm({ username, name }: { username: string; name: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateAccount, {});
  const { formRef, submit } = useRetainOnError(action, state);
  const e = state.fieldErrors ?? {};
  return (
    <form ref={formRef} action={submit} className="space-y-4">
      <Field id="name" label="이름" error={e.name}>
        <Input id="name" name="name" defaultValue={name} maxLength={20} required />
      </Field>
      <Field id="username" label="아이디 (영문 소문자·숫자·_ 3~20자)" error={e.username}>
        <Input id="username" name="username" defaultValue={username} autoComplete="username" required />
      </Field>
      <SaveRow state={state} pending={pending} />
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(changePassword, {});
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4">
      <Field id="current" label="현재 비밀번호" error={e.current}>
        <Input id="current" name="current" type="password" autoComplete="current-password" required />
      </Field>
      <Field id="next" label="새 비밀번호 (8자 이상)" error={e.next}>
        <Input id="next" name="next" type="password" autoComplete="new-password" required />
      </Field>
      <Field id="confirm" label="새 비밀번호 확인" error={e.confirm}>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
      </Field>
      <SaveRow state={state} pending={pending} label="비밀번호 변경" />
    </form>
  );
}

export type ProfileValues = {
  level: SkillLevel | null;
  tools: string | null;
  skills: string | null;
  interests: string | null;
  bio: string | null;
};

export function ProfileForm({ values }: { values: ProfileValues }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfile, {});
  const { formRef, submit } = useRetainOnError(action, state);
  const e = state.fieldErrors ?? {};
  return (
    <form ref={formRef} action={submit} className="space-y-4">
      <Field id="level" label="지금 수준" error={e.level}>
        <Select id="level" name="level" defaultValue={values.level ?? ""}>
          <option value="">선택 안 함</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {LEVEL_LABEL[l]} — {LEVEL_HINT[l]}
            </option>
          ))}
        </Select>
      </Field>
      <Field id="tools" label={`주요 사용 언어 · 툴/도구 (${MAX_PROFILE.tools}자 이하)`} error={e.tools}>
        <Input
          id="tools"
          name="tools"
          defaultValue={values.tools ?? ""}
          maxLength={MAX_PROFILE.tools}
          placeholder="예) Python, TypeScript / React, FastAPI, Figma, Git"
        />
      </Field>
      <Field id="skills" label={`구현할 수 있는 것 (${MAX_PROFILE.skills}자 이하)`} error={e.skills}>
        <Textarea
          id="skills"
          name="skills"
          defaultValue={values.skills ?? ""}
          maxLength={MAX_PROFILE.skills}
          placeholder="예) React로 CRUD 화면 구현, FastAPI로 REST API, 간단한 RAG 챗봇 구축"
        />
      </Field>
      <Field id="interests" label={`관심 분야 · 만들고 싶은 것 (${MAX_PROFILE.interests}자 이하)`} error={e.interests}>
        <Textarea
          id="interests"
          name="interests"
          defaultValue={values.interests ?? ""}
          maxLength={MAX_PROFILE.interests}
          placeholder="예) LLM 에이전트, 데이터 시각화, 교육용 서비스"
        />
      </Field>
      <Field id="bio" label={`소개 · 경험 · 레퍼런스 (${MAX_PROFILE.bio}자 이하)`} error={e.bio}>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={values.bio ?? ""}
          maxLength={MAX_PROFILE.bio}
          className="min-h-40"
          placeholder="해 본 프로젝트, 참여했던 활동, 배우고 싶은 것 등을 자유롭게 적어 주세요"
        />
      </Field>
      <SaveRow state={state} pending={pending} />
    </form>
  );
}
