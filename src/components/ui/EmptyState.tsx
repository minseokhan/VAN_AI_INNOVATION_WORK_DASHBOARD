import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

export function EmptyState({
  icon: Icon = Inbox,
  message,
  action,
}: {
  icon?: LucideIcon;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-slate-200 px-6 py-12 text-center">
      <p className="inline-flex items-center gap-2 text-sm text-slate-500">
        <Icon size={16} strokeWidth={1.75} aria-hidden />
        {message}
      </p>
      {action}
    </div>
  );
}
