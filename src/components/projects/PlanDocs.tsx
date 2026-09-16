"use client";

import type { PlanDocKind } from "@prisma/client";
import { FileText, Link2 } from "lucide-react";
import { useState, useTransition } from "react";
import { addPlanDoc, deletePlanDoc } from "@/app/(dashboard)/projects/[id]/actions";
import { SidePanel } from "@/components/projects/SidePanel";
import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/date";
import { ALLOWED_EXT, validateUploadFile } from "@/lib/plan-docs/validation";

export type PlanDocItem = { id: string; kind: PlanDocKind; title: string; url: string; uploaderName: string; createdAt: Date };

const ACCEPT = ALLOWED_EXT.map((e) => `.${e}`).join(",");

export function PlanDocs({ projectId, docs, isAdmin }: { projectId: string; docs: PlanDocItem[]; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<PlanDocKind>("FILE");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const finish = (r: { error?: string }) => {
    setError(r.error ?? null);
    if (!r.error) setOpen(false);
  };

  const submitFile = (fd: FormData) => {
    const file = fd.get("file");
    if (!(file instanceof File) || !file.name) return setError("파일을 선택하세요");
    const err = validateUploadFile(file.name, file.size);
    if (err) return setError(err);
    startTransition(async () => {
      setError(null);
      const body = new FormData();
      body.set("file", file);
      body.set("projectId", projectId);
      const res = await fetch("/api/upload", { method: "POST", body });
      const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !json.url) return setError(json.error ?? "업로드에 실패했습니다");
      const title = String(fd.get("title") ?? "").trim() || file.name;
      finish(await addPlanDoc(projectId, { kind: "FILE", title, url: json.url }));
    });
  };

  const submitLink = (fd: FormData) =>
    startTransition(async () => {
      finish(await addPlanDoc(projectId, { kind: "LINK", title: String(fd.get("title") ?? ""), url: String(fd.get("url") ?? "") }));
    });

  const tabClass = (k: PlanDocKind) =>
    cn("border-b-2 px-2 pb-1 text-xs font-medium transition-colors", tab === k ? "border-navy-700 text-navy-700" : "border-transparent text-slate-500 hover:text-slate-700");

  return (
    <SidePanel
      title="기획안"
      action={
        isAdmin && !open ? (
          <Button variant="text" size="sm" onClick={() => setOpen(true)}>
            추가
          </Button>
        ) : undefined
      }
    >
      {docs.length === 0 ? (
        <p className="text-sm text-slate-400">등록된 기획안이 없습니다</p>
      ) : (
        <ul className="space-y-2">
          {docs.map((d) => {
            const Icon = d.kind === "FILE" ? FileText : Link2;
            return (
              <li key={d.id} className="flex flex-wrap items-center gap-2 text-sm">
                <Icon size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-slate-500" />
                <div className="min-w-0 flex-1">
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="block truncate text-navy-500 hover:underline">
                    {d.title}
                  </a>
                  <p className="text-xs text-slate-500">
                    {d.uploaderName} · {formatDate(d.createdAt)}
                  </p>
                </div>
                {isAdmin && (
                  <ConfirmButton
                    label="삭제"
                    confirmLabel="삭제"
                    message="이 기획안을 삭제할까요?"
                    size="sm"
                    onConfirm={() => deletePlanDoc(projectId, d.id).then((r) => setError(r.error ?? null))}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
      {open && (
        <div className="mt-4 space-y-3 border-t border-slate-200 pt-3">
          <div role="tablist" className="flex gap-3">
            <button type="button" role="tab" aria-selected={tab === "FILE"} className={tabClass("FILE")} onClick={() => setTab("FILE")}>
              파일
            </button>
            <button type="button" role="tab" aria-selected={tab === "LINK"} className={tabClass("LINK")} onClick={() => setTab("LINK")}>
              링크
            </button>
          </div>
          {tab === "FILE" ? (
            <form key="file" action={submitFile} className="space-y-3">
              <Field id="plan-title" label="제목 (비우면 파일명)">
                <Input id="plan-title" name="title" maxLength={100} />
              </Field>
              <Field id="plan-file" label="파일 (20MB 이하)">
                <input id="plan-file" name="file" type="file" accept={ACCEPT} required className="block w-full text-sm text-slate-700" />
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
          ) : (
            <form key="link" action={submitLink} className="space-y-3">
              <Field id="plan-title" label="제목">
                <Input id="plan-title" name="title" maxLength={100} required />
              </Field>
              <Field id="plan-url" label="URL">
                <Input id="plan-url" name="url" type="url" placeholder="https://…" required />
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
          )}
        </div>
      )}
      {!open && error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </SidePanel>
  );
}
