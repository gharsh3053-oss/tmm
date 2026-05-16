import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <main className="virtus-bg flex min-h-screen items-center justify-center px-4 py-16">
      <div className="surface-card w-full max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)] text-xl font-black text-white shadow-lg shadow-[var(--accent-glow)]">
          404
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent-light)]">
          Page not found
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          This page does not exist.
        </h1>
        <p className="mt-4 text-base text-[var(--text-muted)] sm:text-lg">
          The link may be outdated, or the page may have been moved.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/" className="btn-primary">
            Go home
          </Link>
          <Link href="/login" className="btn-ghost">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
