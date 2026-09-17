"use client";

import type { PlanDocKind } from "@prisma/client";
import { FileText, Link2 } from "lucide-react";
import { useState, useTransition } from "react";
import { addProfileLink, deleteProfileLink } from "@/app/(dashboard)/settings/actions";
import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/date";
import { ALLOWED_EXT, validateUploadFile } from "@/lib/plan-docs/validation";

export type PortfolioItem = { id: string; kind: PlanDocKind; title: string; url: string; createdAt: Date };

const ACCEPT = ALLOWED_EXT.map((e) => `.${e}`).join(",");

export function PortfolioLinks({ items }: { items: PortfolioItem[] }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<PlanDocKind>("LINK");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const finish = (r: { error?: string }) => {
    setError(r.error ?? null);
    if (!r.error) setOpen(false);
  };

  const submitLink = (fd: FormData) =>
    startTransition(async () => {
      finish(await addProfileLink({ kind: "LINK", title: String(fd.get("title") ?? ""), url: String(fd.get("url") ?? "") }));
    });

  const submitFile = (fd: FormData) => {
    const file = fd.get("file");
    if (!(file instanceof File) || !file.name) return setError("파일을 선택하세요");
    const err = validateUploadFile(file.name, file.size);
    if (err) return setError(err);
    startTransition(async () => {
      setError(null);
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !json.url) return setError(json.error ?? "업로드에 실패했습니다");
      const title = String(fd.get("title") ?? "").trim() || file.name;
      finish(await addProfileLink({ kind: "FILE", title, url: json.url }));
    });
  };

  const tabClass = (k: PlanDocKind) =>
    cn(
      "border-b-2 px-2 pb-1 text-xs font-medium transition-colors",
      tab === k ? "border-navy-700 text-navy-700" : "border-transparent text-slate-500 hover:text-slate-700",
    );

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">등록된 포트폴리오가 없습니다</p>
      ) : (
        <ul className="space-y-2">
          {items.map((d) => {
            const Icon = d.kind === "FILE" ? FileText : Link2;
            return (
              <li key={d.id} className="flex flex-wrap items-center gap-2 text-sm">
                <Icon size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-slate-500" />
                <div className="min-w-0 flex-1">
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="block truncate text-navy-500 hover:underline">
                    {d.title}
                  </a>
                  <p className="text-xs text-slate-500">{formatDate(d.createdAt)}</p>
                </div>
                <ConfirmButton
                  label="삭제"
                  confirmLabel="삭제"
                  message="이 항목을 삭제할까요?"
                  size="sm"
                  onConfirm={() => deleteProfileLink(d.id).then((r) => setError(r.error ?? null))}
                />
              </li>
            );
          })}
        </ul>
      )}

      {open ? (
        <div className="space-y-3 border-t border-slate-200 pt-3">
          <div role="tablist" className="flex gap-3">
            <button type="button" role="tab" aria-selected={tab === "LINK"} className={tabClass("LINK")} onClick={() => setTab("LINK")}>
              링크
            </button>
            <button type="button" role="tab" aria-selected={tab === "FILE"} className={tabClass("FILE")} onClick={() => setTab("FILE")}>
              파일
            </button>
          </div>
          {tab === "LINK" ? (
            <form key="link" action={submitLink} className="space-y-3">
              <Field id="pf-title" label="제목">
                <Input id="pf-title" name="title" maxLength={100} placeholder="예) 포트폴리오 노션, 깃허브, 이력서" required />
              </Field>
              <Field id="pf-url" label="URL">
                <Input id="pf-url" name="url" type="url" placeholder="https://…" required />
              </Field>
              {error && <p className="text-xs text-red-700">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={pending}>
                  등록
                </Button>
                <Button variant="secondary" size="sm" disabled={pending} onClick={() => setOpen(false)}>
                  취소
                </Button>
              </div>
            </form>
          ) : (
            <form key="file" action={submitFile} className="space-y-3">
              <Field id="pf-file-title" label="제목 (비우면 파일명)">
                <Input id="pf-file-title" name="title" maxLength={100} />
              </Field>
              <Field id="pf-file" label="파일 (20MB 이하)">
                <input id="pf-file" name="file" type="file" accept={ACCEPT} required className="block w-full text-sm text-slate-700" />
              </Field>
              {error && <p className="text-xs text-red-700">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={pending}>
                  {pending ? "업로드 중…" : "업로드"}
                </Button>
                <Button variant="secondary" size="sm" disabled={pending} onClick={() => setOpen(false)}>
                  취소
                </Button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
            추가
          </Button>
          {error && <span className="text-xs text-red-700">{error}</span>}
        </div>
      )}
    </div>
  );
}
