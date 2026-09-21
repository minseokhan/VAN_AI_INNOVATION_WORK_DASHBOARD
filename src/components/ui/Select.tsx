import { cn } from "@/lib/utils/cn";
import { inputClass } from "./Input";

// 브라우저 기본 화살표는 위치를 못 바꾸므로 직접 그린다 (slate-500 chevron, 오른쪽 테두리에서 12px)
const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

// cn 은 단순 join 이라 클래스 충돌을 못 걷어낸다 — 변형은 덧붙이지 않고 기본 클래스를 통째로 교체한다
const underlineClass =
  "rounded-none border-0 border-b border-slate-300 bg-transparent pl-0 py-0.5 text-sm focus:border-navy-500 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500";

export function Select({
  className,
  style,
  variant = "default",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { variant?: "default" | "underline" }) {
  const underline = variant === "underline";
  return (
    <select
      className={cn(
        underline ? underlineClass : inputClass,
        "appearance-none bg-no-repeat",
        underline ? "bg-right pr-5" : "bg-[right_0.75rem_center] pr-9",
        className,
      )}
      style={{ backgroundImage: CHEVRON, ...style }}
      {...props}
    />
  );
}
