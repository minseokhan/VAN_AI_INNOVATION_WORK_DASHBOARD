"use client";

import { useState, useTransition } from "react";
import { sendDigestNow } from "@/app/(dashboard)/questions/actions";
import { Button } from "@/components/ui/Button";

export function DigestButton({ pendingCount }: { pendingCount: number }) {
  const [result, setResult] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        disabled={pending || pendingCount === 0}
        onClick={() =>
          startTransition(async () => {
            const r = await sendDigestNow();
            setResult(r.error ?? `${r.sent}건 전송했습니다`);
          })
        }
      >
        미발송 {pendingCount}건 · 디스코드로 지금 보내기
      </Button>
      {result && <span className="text-xs text-slate-500">{result}</span>}
    </div>
  );
}
