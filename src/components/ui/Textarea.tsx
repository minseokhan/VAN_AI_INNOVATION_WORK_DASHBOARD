import { cn } from "@/lib/utils/cn";
import { inputClass } from "./Input";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputClass, "min-h-24 leading-relaxed", className)} {...props} />;
}
