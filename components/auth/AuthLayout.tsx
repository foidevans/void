import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div
        aria-hidden
        className="pointer-events-none fixed -right-24 -top-24 h-[500px] w-[500px] rounded-full"
        style={{ background: "var(--accent)", filter: "blur(100px)", opacity: "var(--orb-opacity)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -bottom-20 -left-20 h-[400px] w-[400px] rounded-full"
        style={{ background: "var(--accent)", filter: "blur(100px)", opacity: "var(--orb-opacity)" }}
      />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}