"use client";

import Link from "next/link";
import { InteractiveBackground } from "./InteractiveBackground";

export function PublicHero() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#121212] px-4">
      <InteractiveBackground />
      <div className="relative z-10 max-w-2xl text-center">
        <div className="mb-6 inline-flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-xl font-black text-white shadow-lg shadow-[var(--accent-glow)]">
            V
          </div>
          <span className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--accent-light)]">
            Virtus
          </span>
        </div>
        <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
          <span className="gradient-text">Project management</span>
          <br />
          <span className="text-white">built for high performers</span>
        </h1>
        <p className="mt-6 text-lg text-[var(--text-muted)]">
          Track team progress, goals, and deadlines — with clarity your leadership team will love.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/signup" className="btn-primary">
            Get Started
          </Link>
          <Link href="/login" className="btn-ghost">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
