"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { STATUS_LABEL } from "@/lib/projects/labels";
import { cn } from "@/lib/utils/cn";

const STATUSES = ["ALL", "UNASSIGNED", "IN_PROGRESS", "DONE"] as const;

export function FilterBar({ categories }: { categories: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const status = params.get("status") ?? "ALL";
  const category = params.get("category") ?? "ALL";
  const [q, setQ] = useState(params.get("q") ?? "");

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v && v !== "ALL") next.set(k, v);
      else next.delete(k);
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  // 검색어는 타이핑이 멈춘 뒤 URL에 반영 (URL이 진실)
  useEffect(() => {
    if (q === (params.get("q") ?? "")) return;
    const t = setTimeout(() => update({ q }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <div role="group" aria-label="상태" className="inline-flex rounded-md border border-slate-300">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={status === s}
            onClick={() => update({ status: s })}
            className={cn(
              "px-3 py-1.5 text-xs transition-colors first:rounded-l-md last:rounded-r-md",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500",
              status === s ? "bg-navy-100 font-medium text-navy-700" : "text-slate-600 hover:bg-slate-50",
            )}
          >
            {s === "ALL" ? "전체" : STATUS_LABEL[s]}
          </button>
        ))}
      </div>
      <Select aria-label="분야" value={category} onChange={(e) => update({ category: e.target.value })} className="w-auto">
        <option value="ALL">전체 분야</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Select>
      <Input
        type="search"
        aria-label="검색"
        placeholder="제목, 과제 번호, 요약 검색"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-64"
      />
    </div>
  );
}
