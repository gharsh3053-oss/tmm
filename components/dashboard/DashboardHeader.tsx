"use client";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function DashboardHeader({
  title,
  userName,
}: {
  title: string;
  userName: string;
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg)]/95 px-8 py-5 backdrop-blur-md">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--accent-light)]">
          Welcome back
        </p>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="rounded-2xl bg-[var(--surface)] px-4 py-2 text-sm text-[var(--text-muted)]">
          {new Date().toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </span>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent)] text-xs font-bold text-white shadow-lg shadow-[var(--accent-glow)]"
          title={userName}
        >
          {getInitials(userName)}
        </div>
      </div>
    </header>
  );
}
