import { cn } from "@/lib/utils/cn";
import { inputClass } from "./Input";

// 브라우저 기본 화살표는 위치를 못 바꾸므로 직접 그린다 (slate-500 chevron, 오른쪽 테두리에서 12px)
const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

export function Select({ className, style, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(inputClass, "appearance-none bg-no-repeat bg-[right_0.75rem_center] pr-9", className)}
      style={{ backgroundImage: CHEVRON, ...style }}
      {...props}
    />
  );
}
