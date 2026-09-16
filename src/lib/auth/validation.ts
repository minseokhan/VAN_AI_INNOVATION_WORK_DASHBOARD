export type RegisterInput = { username: string; password: string; name: string };

export type RegisterResult = { ok: true } | { ok: false; errors: Partial<Record<keyof RegisterInput, string>> };

export function validateRegister(input: RegisterInput): RegisterResult {
  const errors: Partial<Record<keyof RegisterInput, string>> = {};
  if (!/^[a-z0-9_]{3,20}$/.test(input.username)) {
    errors.username = "아이디는 3~20자의 영문 소문자, 숫자, _만 사용할 수 있습니다";
  }
  if (input.password.length < 8) {
    errors.password = "비밀번호는 8자 이상이어야 합니다";
  }
  const name = input.name.trim();
  if (name.length < 1 || name.length > 20) {
    errors.name = "이름은 1~20자여야 합니다";
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true };
}
