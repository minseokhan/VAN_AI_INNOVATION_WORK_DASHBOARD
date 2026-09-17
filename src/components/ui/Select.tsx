import { cn } from "@/lib/utils/cn";
import { inputClass } from "./Input";

// 브라우저 기본 화살표는 위치를 못 바꾸므로 직접 그린다 (slate-500 chevron, 오른쪽 12px 여백)
const chevron =
  "appearance-none bg-no-repeat bg-[right_0.75rem_center] pr-9 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22m6 9 6 6 6-6%22/></svg>')]";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(inputClass, chevron, className)} {...props} />;
}
