"use client";

import { useEffect, useRef } from "react";

type Failable = { error?: string; ok?: boolean; fieldErrors?: Record<string, string | undefined> };

function failed(state: Failable) {
  return Boolean(state.error) || Object.values(state.fieldErrors ?? {}).some(Boolean);
}

/**
 * React 19 는 form action 이 끝나면 uncontrolled 폼을 reset 한다. 검증 에러로 돌아온 경우에도
 * 리셋되어 사용자가 적은 값이 defaultValue 로 되돌아가므로, 제출 당시의 값을 붙잡아 두었다가
 * 실패 응답일 때만 폼에 되돌린다. 성공 시에는 기존 초기화 동작을 그대로 둔다.
 *
 *   const [state, action, pending] = useActionState(fn, {});
 *   const { formRef, submit } = useRetainOnError(action, state);
 *   <form ref={formRef} action={submit}>
 */
export function useRetainOnError(action: (fd: FormData) => void, state: Failable) {
  const formRef = useRef<HTMLFormElement>(null);
  const sent = useRef<FormData | null>(null);

  const submit = (fd: FormData) => {
    sent.current = fd;
    action(fd);
  };

  useEffect(() => {
    const form = formRef.current;
    const fd = sent.current;
    if (!form || !fd || !failed(state)) return;
    for (const [name, value] of fd.entries()) {
      if (typeof value !== "string") continue;
      const el = form.elements.namedItem(name);
      // 비밀번호는 되돌리지 않는다. 라디오/체크박스 그룹(RadioNodeList)도 대상 밖.
      if (el instanceof HTMLInputElement) {
        if (el.type !== "password") el.value = value;
      } else if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
        el.value = value;
      }
    }
  }, [state]);

  return { formRef, submit };
}
