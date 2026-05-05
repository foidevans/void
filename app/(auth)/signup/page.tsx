import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignupForm } from "@/components/auth/SignupForm";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function SignupPage() {
  return (
    <AuthLayout>
      <ThemeToggle />

      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-8">
        <header className="flex flex-col items-center gap-2 text-center">
          <h1
            className="text-3xl font-extrabold uppercase tracking-[0.3em] text-[var(--accent)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            VOID
          </h1>
          <p className="text-[13px] uppercase tracking-widest text-[var(--text-muted)]">
            Presence of Absence
          </p>
        </header>

        <section className="glass-card px-10 py-10">
          <h2
            className="mb-1 text-[22px] font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Create Account
          </h2>
          <p className="mb-7 text-sm text-[var(--text-secondary)]">
            Join the digital quietude.
          </p>
          <SignupForm />
        </section>

        <footer className="flex flex-col items-center gap-4">
          <p className="text-[13px] text-[var(--text-secondary)]">
            Already part of the void?{" "}
            <Link
              href="/login"
              className="text-[var(--accent-text)] hover:underline underline-offset-4"
            >
              Sign In
            </Link>
          </p>
          <div className="flex gap-6 opacity-20">
            <span className="material-symbols-outlined">fingerprint</span>
            <span className="material-symbols-outlined">shield_lock</span>
            <span className="material-symbols-outlined">verified_user</span>
          </div>
        </footer>
      </div>
    </AuthLayout>
  );
}