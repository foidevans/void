import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function LoginPage() {
  return (
    <AuthLayout>
      <ThemeToggle />

      <div className="mx-auto flex w-full max-w-[440px] flex-col gap-8">
        <header className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#6c3bff] to-[#a855f7]">
            <span className="material-symbols-outlined text-white" style={{ fontSize: 22 }}>
              lens_blur
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-[0.12em] text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
            VOID
          </h1>
          <p className="text-[13px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
            The presence of absence
          </p>
        </header>

        <section className="glass-card px-10 py-10">
          <h2 className="mb-1 text-[22px] font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
            Welcome back
          </h2>
          <p className="mb-7 text-sm text-[var(--text-secondary)]">
            Enter the void to continue.
          </p>
          <LoginForm />
        </section>

        <footer className="flex flex-col items-center gap-2 text-center">
          <p className="text-[13px] text-[var(--text-secondary)]">
            New to VOID?{" "}
            <Link href="/signup" className="text-[var(--accent-text)] hover:underline underline-offset-4">
              Create an identity
            </Link>
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]">
              Terms of Service
            </Link>
          </div>
        </footer>
      </div>
    </AuthLayout>
  );
}