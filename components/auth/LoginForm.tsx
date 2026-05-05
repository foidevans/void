"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";

export function LoginForm() {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!username.trim()) return setError("Username is required.");
    if (!password) return setError("Password is required.");

    setIsLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed.";
      if (message.toLowerCase().includes("credentials")) {
        setError("Incorrect username or password.");
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <InputField
        label="Username"
        type="text"
        placeholder="identity@void.space"
        autoComplete="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        icon={
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            alternate_email
          </span>
        }
      />

      <InputField
        label="Password"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            lock
          </span>
        }
        rightSlot={
          <Link
            href="#"
            className="text-xs text-[var(--accent-text)] transition-opacity hover:opacity-70"
          >
            Forgot password?
          </Link>
        }
      />

      {error && (
        <p className="text-[12px] text-[var(--error)]" role="alert">
          {error}
        </p>
      )}

      {isLoading && (
        <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)]">
          Deriving keys...
        </p>
      )}

      <div className="flex flex-col gap-3 pt-1">
        <Button type="submit" isLoading={isLoading}>
          Continue to Presence
          {!isLoading && (
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              arrow_forward
            </span>
          )}
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-[11px] uppercase tracking-widest text-[var(--text-muted)]">
            or
          </span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        <Button type="button" variant="ghost">
          <GoogleIcon />
          Sign in with Google
        </Button>
      </div>
    </form>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-[18px] w-[18px] opacity-70" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}