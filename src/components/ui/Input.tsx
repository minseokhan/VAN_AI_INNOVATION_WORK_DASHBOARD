import { cn } from "@/lib/utils/cn";

export const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-navy-500 focus:ring-2 focus:ring-navy-100 focus:outline-none";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClass, className)} {...props} />;
}
