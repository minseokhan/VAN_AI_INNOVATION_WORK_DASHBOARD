import { cn } from "@/lib/utils/cn";
import { getInitials } from "@/lib/utils/initials";

export function Avatar({ name, title, className }: { name: string; title?: string; className?: string }) {
  return (
    <span
      title={title ?? name}
      className={cn(
        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-semibold text-navy-700",
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}
