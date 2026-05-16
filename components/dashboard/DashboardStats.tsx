"use client";

import { useEffect, useState } from "react";
import { LoadingPulse } from "@/components/ui";

type DashboardStatsData = {
  stats: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
    overdue: number;
  };
  tasksPerUser: Array<{
    userId: string;
    name: string;
    total: number;
    todo: number;
    inProgress: number;
    done: number;
    overdue: number;
  }>;
  overdueTasks: Array<{
    id: string;
    title: string;
    dueDate: string | null;
    project: { name: string };
    assignee: { name: string } | null;
  }>;
};

export function DashboardStats() {
  const [data, setData] = useState<DashboardStatsData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    function refresh() {
      fetch("/api/dashboard")
        .then((r) => r.json())
        .then((d) => {
          if (!d.error) setData(d);
        })
        .catch(() => {});
    }
    window.addEventListener("tasktrack:task-created", refresh);
    return () => window.removeEventListener("tasktrack:task-created", refresh);
  }, []);

  if (error) {
    return (
      <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
        {error}
      </p>
    );
  }

  if (!data) return <LoadingPulse text="Loading task analytics..." />;

  const { stats, tasksPerUser, overdueTasks } = data;

  return (
    <section className="space-y-4" aria-label="Task analytics">
      <div>
        <h2 className="text-lg font-semibold text-white">Task overview</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Totals across your projects — by status, assignee, and overdue
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Total", value: stats.total },
          { label: "To Do", value: stats.todo },
          { label: "In Progress", value: stats.inProgress },
          { label: "Done", value: stats.done },
          { label: "Overdue", value: stats.overdue, accent: true },
        ].map((item) => (
          <div
            key={item.label}
            className={`surface-card p-4 ${item.accent ? "border-rose-500/30" : ""}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
              {item.label}
            </p>
            <p
              className={`mt-1 text-2xl font-bold tabular-nums ${
                item.accent ? "text-rose-400" : "text-white"
              }`}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold text-white">Tasks per user</h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Assigned workload by team member
          </p>
          {tasksPerUser.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--text-muted)]">No tasks yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {tasksPerUser.map((u) => (
                <li
                  key={u.userId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2.5"
                >
                  <span className="font-medium text-white">{u.name}</span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {u.total} total · {u.todo} todo · {u.inProgress} active ·{" "}
                    {u.done} done
                    {u.overdue > 0 && (
                      <span className="ml-1 text-rose-400">· {u.overdue} overdue</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold text-white">Overdue tasks</h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Past due date and not marked done
          </p>
          {overdueTasks.length === 0 ? (
            <p className="mt-4 text-sm text-emerald-400/90">No overdue tasks.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {overdueTasks.map((t) => (
                <li
                  key={t.id}
                  className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2.5 text-sm"
                >
                  <p className="font-medium text-white">{t.title}</p>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    {t.project.name}
                    {t.assignee ? ` · ${t.assignee.name}` : ""} · Due{" "}
                    {t.dueDate
                      ? new Date(t.dueDate).toLocaleDateString()
                      : "—"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
