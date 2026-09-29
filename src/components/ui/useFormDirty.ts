"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

function changed(el: Element): boolean {
  if (el instanceof HTMLInputElement) {
    if (el.type === "checkbox" || el.type === "radio") return el.checked !== el.defaultChecked;
    if (el.type === "file") return el.files !== null && el.files.length > 0;
    return el.value !== el.defaultValue;
  }
  if (el instanceof HTMLTextAreaElement) return el.value !== el.defaultValue;
  if (el instanceof HTMLSelectElement) return [...el.options].some((o) => o.selected !== o.defaultSelected);
  return false;
}

function isDirty(form: HTMLFormElement | null): boolean {
  return form !== null && [...form.elements].some(changed);
}

/**
 * 바뀐 게 없는데 저장을 누르면 서버에 쓰지 않고 "변경된 내용이 없습니다"를 띄운다.
 * 버튼을 미리 막지는 않는다 — 누르기 전까지 안내 문구가 떠 있으면 방해가 된다.
 *
 *   const { noChange, check, guard } = useFormDirty(formRef, state);
 *   <form ref={formRef} action={guard(submit)} onInput={check} onChange={check}>
 *   {noChange && <span>변경된 내용이 없습니다</span>}
 */
export function useFormDirty(formRef: RefObject<HTMLFormElement | null>, state?: unknown) {
  const [noChange, setNoChange] = useState(false);

  // 값을 고치는 순간 안내를 거둔다
  const check = useCallback(() => {
    if (isDirty(formRef.current)) setNoChange(false);
  }, [formRef]);

  const guard = useCallback(
    (run: (fd: FormData) => void) => (fd: FormData) => {
      if (!isDirty(formRef.current)) return setNoChange(true);
      setNoChange(false);
      run(fd);
    },
    [formRef],
  );

  // 서버 응답이 오면(저장 성공·검증 실패) 이전 안내는 의미가 없다
  useEffect(() => setNoChange(false), [state]);

  return { noChange, check, guard };
}
