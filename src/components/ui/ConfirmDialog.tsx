"use client";

import { useRef, useTransition } from "react";
import { Button, type ButtonProps } from "@/components/ui/Button";

/** 버튼 → 네이티브 <dialog> 모달로 재확인 → onConfirm. 되돌릴 수 없는 삭제에 쓴다. */
export function ConfirmDialog({
  label,
  title,
  message,
  confirmLabel,
  onConfirm,
  variant = "danger",
}: {
  label: string;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void | Promise<unknown>;
  variant?: ButtonProps["variant"];
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  return (
    <>
      <Button variant={variant} onClick={() => ref.current?.showModal()}>
        {label}
      </Button>
      <dialog
        ref={ref}
        className="m-auto w-full max-w-sm rounded-md border border-slate-200 bg-white p-6 shadow-lg backdrop:bg-slate-900/40"
        onClick={(e) => e.target === ref.current && ref.current.close()}
      >
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" disabled={pending} onClick={() => ref.current?.close()}>
            취소
          </Button>
          <Button variant={variant} disabled={pending} onClick={() => startTransition(async () => { await onConfirm(); })}>
            {pending ? "삭제 중…" : confirmLabel}
          </Button>
        </div>
      </dialog>
    </>
  );
}
