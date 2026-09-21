"use client";

import { useState, useTransition } from "react";
import { Button, type ButtonProps } from "@/components/ui/Button";

/** 2단계 확인 버튼: 클릭 → 확인 문구 + [확인] [취소] */
export function ConfirmButton({
  label,
  confirmLabel,
  message,
  onConfirm,
  variant = "danger",
  size = "md",
}: {
  label: string;
  confirmLabel: string;
  message: string;
  onConfirm: () => void | Promise<unknown>;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  if (!confirming) {
    return (
      <Button variant={variant} size={size} onClick={() => setConfirming(true)}>
        {label}
      </Button>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-sm text-slate-700">{message}</p>
      <Button
        variant={variant}
        size={size}
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await onConfirm();
            setConfirming(false);
          })
        }
      >
        {confirmLabel}
      </Button>
      <Button variant="secondary" size="sm" disabled={pending} onClick={() => setConfirming(false)}>
        취소
      </Button>
    </div>
  );
}
