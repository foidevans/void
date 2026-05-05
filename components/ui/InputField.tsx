import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  error?: string;
  rightSlot?: ReactNode;
}

export function InputField({
  label,
  icon,
  error,
  rightSlot,
  className,
  ...props
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
          {label}
        </label>
        {rightSlot}
      </div>

      <div className="group relative">
        <input
          className={cn(
            "input-void",
            error && "border-b-[var(--error)]",
            icon && "pr-10",
            className
          )}
          {...props}
        />
        {icon && (
          <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--accent-text)]">
            {icon}
          </span>
        )}
      </div>

      {error && (
        <p className="text-[11px] font-medium uppercase tracking-tight text-[var(--error)]">
          {error}
        </p>
      )}
    </div>
  );
}