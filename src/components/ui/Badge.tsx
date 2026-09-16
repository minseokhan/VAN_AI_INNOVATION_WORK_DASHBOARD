import { cn } from "@/lib/utils/cn";

export type BadgeTone = "neutral" | "navy" | "green" | "amber" | "red";

const TONE: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-600",
  navy: "bg-navy-100 text-navy-700",
  green: "bg-green-100 text-green-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn("inline-flex items-center rounded px-2 py-0.5 text-xs font-medium", TONE[tone], className)}
      {...props}
    />
  );
}
