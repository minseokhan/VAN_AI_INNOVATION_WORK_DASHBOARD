import { cn } from "@/lib/utils/cn";
import { inputClass } from "./Input";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(inputClass, className)} {...props} />;
}
