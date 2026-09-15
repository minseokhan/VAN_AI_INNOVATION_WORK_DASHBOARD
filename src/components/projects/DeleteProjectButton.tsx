"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";

export function DeleteProjectButton({ action }: { action: () => Promise<void> }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  if (!confirming) {
    return (
      <Button variant="danger" onClick={() => setConfirming(true)}>
        프로젝트 삭제
      </Button>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-sm text-slate-700">정말 삭제하시겠습니까? 기능·보고·질문이 모두 삭제됩니다</p>
      <Button variant="danger" disabled={pending} onClick={() => startTransition(action)}>
        삭제 확인
      </Button>
      <Button variant="secondary" size="sm" disabled={pending} onClick={() => setConfirming(false)}>
        취소
      </Button>
    </div>
  );
}
