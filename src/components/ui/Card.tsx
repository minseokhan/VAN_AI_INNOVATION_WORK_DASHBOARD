import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const base = "block rounded-md border border-slate-200 bg-white p-5";

export function Card({
  href,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { href?: string }) {
  if (href) {
    return (
      <Link href={href} className={cn(base, "transition-colors hover:border-navy-500", className)}>
        {children}
      </Link>
    );
  }
  return (
    <div className={cn(base, className)} {...props}>
      {children}
    </div>
  );
}
