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

/**
 * 폼의 현재 값이 defaultValue 와 다른지 추적한다. 바뀐 게 없으면 저장 버튼을 막기 위한 것.
 * 제출이 끝나면(성공이든 실패든) 다시 계산한다 — 성공 시 React 19 가 폼을 리셋하고,
 * 실패 시 useRetainOnError 가 값을 되돌려 놓기 때문.
 *
 *   const { dirty, check } = useFormDirty(formRef, state);
 *   <form ref={formRef} action={submit} onInput={check} onChange={check}>
 */
export function useFormDirty(formRef: RefObject<HTMLFormElement | null>, state?: unknown) {
  const [dirty, setDirty] = useState(false);

  const check = useCallback(() => {
    const form = formRef.current;
    setDirty(form ? [...form.elements].some(changed) : false);
  }, [formRef]);

  // 제출 결과로 폼 값이 바뀌므로 렌더 후 한 번 더 확인한다
  useEffect(() => {
    const id = requestAnimationFrame(check);
    return () => cancelAnimationFrame(id);
  }, [check, state]);

  return { dirty, check };
}
