import type { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent: "amber" | "emerald" | "rose" | "indigo" | "teal";
};

const accents = {
  amber: {
    icon: "bg-amber-500/15 text-amber-400",
    watermark: "text-amber-500/8",
    value: "text-amber-50",
  },
  emerald: {
    icon: "bg-emerald-500/15 text-emerald-400",
    watermark: "text-emerald-500/8",
    value: "text-emerald-50",
  },
  rose: {
    icon: "bg-rose-500/15 text-rose-400",
    watermark: "text-rose-500/8",
    value: "text-rose-50",
  },
  indigo: {
    icon: "bg-indigo-500/15 text-indigo-400",
    watermark: "text-indigo-500/8",
    value: "text-indigo-50",
  },
  teal: {
    icon: "bg-teal-500/15 text-teal-400",
    watermark: "text-teal-500/8",
    value: "text-teal-50",
  },
};

export function MetricCard({ label, value, icon, accent }: MetricCardProps) {
  const styles = accents[accent];

  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-5">
      <div className={`absolute -right-2 -top-2 opacity-100 ${styles.watermark}`}>
        <div className="scale-[3] opacity-40">{icon}</div>
      </div>
      <div className={`relative z-10 inline-flex rounded-lg p-2 ${styles.icon}`}>{icon}</div>
      <p className="relative z-10 mt-3 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </p>
      <p className={`relative z-10 mt-1 text-3xl font-bold tabular-nums ${styles.value}`}>
        {value}
      </p>
    </div>
  );
}
