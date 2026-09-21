"use client";

import { Printer } from "lucide-react";
import { useState } from "react";
import { deleteExpense } from "@/app/(dashboard)/expenses/actions";
import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";

export function DeleteExpenseButton({ id, title }: { id: string; title: string }) {
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="no-print">
      <ConfirmButton
        label="삭제"
        confirmLabel="삭제"
        message={`"${title}" 청구를 삭제할까요?`}
        size="sm"
        onConfirm={() => deleteExpense(id).then((r) => setError(r.error ?? null))}
      />
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}

export function PrintButton() {
  return (
    <Button variant="secondary" onClick={() => window.print()}>
      <Printer size={16} strokeWidth={1.75} aria-hidden />
      PDF로 저장 · 인쇄
    </Button>
  );
}
