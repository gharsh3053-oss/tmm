"use client";

import { InteractiveBackground } from "./InteractiveBackground";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#121212] px-4 py-12">
      <InteractiveBackground />
      <div className="bento-card relative z-10 w-full max-w-md p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent)] font-black text-white">
            V
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-light)]">
            Virtus
          </p>
        </div>
        <h1 className="text-3xl font-bold gradient-text">{title}</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
        <div className="mt-8">{children}</div>
        <div className="mt-6 text-center text-sm text-[var(--text-muted)]">{footer}</div>
      </div>
    </div>
  );
}
