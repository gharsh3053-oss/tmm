"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthShell, LinkAccent } from "@/components/ui";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start managing team progress in minutes"
      footer={
        <>
          Already have an account? <LinkAccent href="/login">Sign in</LinkAccent>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-300">
            {error}
          </p>
        )}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
            Full Name
          </label>
          <input name="name" required className="input-field" placeholder="Alex Morgan" />
        </div>
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
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="input-field"
            placeholder="Minimum 6 characters"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>
    </AuthShell>
  );
}
