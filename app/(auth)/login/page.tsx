"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { AuthShell, LinkAccent } from "@/components/ui";
import { apiFetch } from "@/lib/client-fetch";

function LoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const from = searchParams.get("from");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      window.location.href = from && from.startsWith("/") ? from : "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Secure login with JWT session cookie"
      footer={
        <>
          New to Task Track? <LinkAccent href="/signup">Create an account</LinkAccent>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {from && (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-200">
            Please sign in to continue.
          </p>
        )}
        {error && (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-300">
            {error}
          </p>
        )}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
            Email
          </label>
          <input name="email" type="email" required className="input-field" placeholder="you@company.com" />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
            Password
          </label>
          <input name="password" type="password" required className="input-field" placeholder="••••••••" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="virtus-bg min-h-screen" />}>
      <LoginForm />
    </Suspense>
  );
}
