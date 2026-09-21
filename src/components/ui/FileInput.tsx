import { cn } from "@/lib/utils/cn";

/** 파일 첨부 칸. 기본 file input 은 클릭 가능한 영역인지 알아보기 어려워 테두리와 버튼 모양을 입힌다 */
export function FileInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="file"
      className={cn(
        "block w-full cursor-pointer rounded-md border border-dashed border-slate-300 bg-white p-2.5 text-sm text-slate-500",
        "transition-colors hover:border-navy-500 focus:border-navy-500 focus:ring-2 focus:ring-navy-100 focus:outline-none",
        "file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5",
        "file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-50",
        className,
      )}
      {...props}
    />
  );
}
