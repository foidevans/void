"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";

export function SignupForm() {
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordMismatch = confirm.length > 0 && password !== confirm;

  function validate() {
    const e: Record<string, string> = {};
    if (!displayName.trim()) e.displayName = "Full name is required.";
    if (!username.trim()) e.username = "Username is required.";
    if (!/^[a-zA-Z0-9_-]{3,32}$/.test(username))
      e.username = "3–32 chars, letters/digits/_ only.";
    if (password.length < 8) e.password = "Minimum 8 characters.";
    if (password !== confirm) e.confirm = "Passwords must match.";
    if (!agreed) e.terms = "You must accept the terms to continue.";
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    setErrors({});
    setIsLoading(true);
    try {
      await register({
        username: username.trim().toLowerCase(),
        displayName: displayName.trim(),
        password,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed.";
      if (message.toLowerCase().includes("taken") || message.includes("409")) {
        setErrors({ username: "Username is already taken." });
      } else {
        setErrors({ form: message });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <InputField
        label="Full Name"
        type="text"
        placeholder="Elias Vance"
        autoComplete="name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        error={errors.displayName}
        icon={
          displayName.trim().length > 1 ? (
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20, color: "var(--success)" }}
            >
              check_circle
            </span>
          ) : undefined
        }
      />

      <InputField
        label="Username"
        type="text"
        placeholder="elias_vance"
        autoComplete="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        error={errors.username}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <InputField
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <InputField
          label="Confirm"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={passwordMismatch ? "Passwords must match" : errors.confirm}
        />
      </div>

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="h-4 w-4 cursor-pointer rounded accent-[var(--accent)]"
        />
        <span className="text-xs text-[var(--text-secondary)]">
          I accept the{" "}
          <Link
            href="#"
            className="text-[var(--accent-text)] underline underline-offset-2"
          >
            Terms of Silence
          </Link>{" "}
          and Privacy Policy.
        </span>
      </label>
      {errors.terms && (
        <p className="text-[11px] text-[var(--error)]">{errors.terms}</p>
      )}

      {errors.form && (
        <p className="text-[12px] text-[var(--error)]" role="alert">
          {errors.form}
        </p>
      )}

      {isLoading && (
        <p className="text-[11px] uppercase tracking-widest text-[var(--text-muted)]">
          Generating your keys...
        </p>
      )}

      <Button type="submit" isLoading={isLoading} className="mt-1">
        Initialize Identity
      </Button>
    </form>
  );
}