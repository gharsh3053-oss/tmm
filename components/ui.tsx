import Link from "next/link";

export { AuthShell } from "@/components/auth/AuthShell";

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    TODO: "badge bg-[var(--surface-raised)] text-[var(--text-muted)] border border-[var(--border)]",
    IN_PROGRESS: "badge bg-[var(--accent-muted)] text-[var(--accent-light)] border border-[var(--accent)]/30",
    DONE: "badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    ADMIN: "badge bg-[var(--accent-muted)] text-[var(--accent-light)] border border-[var(--accent)]/30",
    MEMBER: "badge bg-[var(--surface-raised)] text-[var(--text-muted)] border border-[var(--border)]",
  };
  const labels: Record<string, string> = {
    TODO: "Pending",
    IN_PROGRESS: "Progress",
    DONE: "Done",
    ADMIN: "Lead",
    MEMBER: "Member",
  };
  return (
    <span className={map[status] ?? "badge bg-white/10 text-zinc-300"}>
      {labels[status] ?? status.replace("_", " ")}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function LoadingPulse({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center gap-3 text-[var(--text-muted)]">
      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" />
      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--accent-light)] [animation-delay:150ms]" />
      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--accent-hover)] [animation-delay:300ms]" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

export function LinkAccent({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-semibold text-[var(--accent-light)] hover:text-[var(--accent-hover)] transition">
      {children}
    </Link>
  );
}
