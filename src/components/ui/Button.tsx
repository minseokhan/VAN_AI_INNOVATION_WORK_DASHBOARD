import { cn } from "@/lib/utils/cn";

const VARIANT = {
  primary: "rounded-md bg-navy-700 text-white font-medium hover:bg-navy-900",
  secondary: "rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  danger: "rounded-md text-red-700 hover:bg-red-50",
  text: "text-navy-500 hover:underline",
} as const;

const SIZE = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" } as const;

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANT;
  size?: keyof typeof SIZE;
};

export function Button({ variant = "primary", size = "md", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center gap-1.5 transition-colors disabled:opacity-60",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500",
        VARIANT[variant],
        variant === "text" ? (size === "sm" ? "text-xs" : "text-sm") : SIZE[size],
        className,
      )}
      {...props}
    />
  );
}
