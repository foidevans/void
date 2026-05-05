import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  children: ReactNode;
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  children,
  isLoading,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "w-full flex items-center justify-center gap-2 rounded-[10px] px-4 py-[14px] text-sm font-semibold tracking-wide transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const variants = {
    primary:
      "bg-[var(--accent)] text-white hover:shadow-[0_0_24px_var(--accent-glow)] hover:-translate-y-px",
    ghost:
      "bg-transparent border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
  };

  return (
    <button
      className={cn(base, variants[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}