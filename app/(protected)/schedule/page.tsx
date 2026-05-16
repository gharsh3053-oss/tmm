"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCreateTask } from "@/components/dashboard/CreateTaskContext";
import { LoadingPulse, StatusBadge } from "@/components/ui";

type DashboardData = {
  myTasks: Array<{
    id: string;
    title: string;
    status: string;
    dueDate: string | null;
    project: { id: string; name: string };
  }>;
  overdueTasks: Array<{
    id: string;
    title: string;
    status: string;
    dueDate: string | null;
    project: { id: string; name: string };
  }>;
};

function formatDue(dueDate: string | null) {
  if (!dueDate) return "No due date";
  return new Date(dueDate).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function SchedulePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const { openCreateTask } = useCreateTask();

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
        {error}
      </p>
    );
  }

  if (!data) return <LoadingPulse text="Loading schedule..." />;

  const today = new Date().toDateString();
  const todayTasks = data.myTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate).toDateString() === today
  );
  const upcomingTasks = data.myTasks.filter(
    (t) => !t.dueDate || new Date(t.dueDate).toDateString() !== today
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Schedule</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Your tasks organized by timeline
          </p>
        </div>
        <button type="button" onClick={() => openCreateTask()} className="btn-primary">
          + Create Task
        </button>
      </div>

      <div className="bento-card">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--accent-light)]">
          Today
        </h3>
        {todayTasks.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--text-dim)]">No tasks due today.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {todayTasks.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-4 rounded-2xl bg-[var(--bg-elevated)] p-4"
              >
                <div>
                  <Link
                    href={`/projects/${t.project.id}`}
                    className="font-semibold text-white hover:text-[var(--accent-light)]"
                  >
                    {t.title}
                  </Link>
                  <p className="text-xs text-[var(--text-dim)]">{t.project.name}</p>
                </div>
                <StatusBadge status={t.status} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bento-card">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Upcoming
        </h3>
        {upcomingTasks.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--text-dim)]">No upcoming tasks assigned.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {upcomingTasks.map((t) => (
              <li
                key={t.id}
                className="surface-card-hover flex items-center justify-between gap-4 rounded-2xl border border-[var(--border-subtle)] p-4"
              >
                <div>
                  <Link
                    href={`/projects/${t.project.id}`}
                    className="font-semibold text-white hover:text-[var(--accent-light)]"
                  >
                    {t.title}
                  </Link>
                  <p className="text-xs text-[var(--text-dim)]">
                    {t.project.name} · {formatDue(t.dueDate)}
                  </p>
                </div>
                <StatusBadge status={t.status} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {data.overdueTasks.length > 0 && (
        <div className="bento-card border-rose-500/20">
          <h3 className="text-sm font-semibold text-rose-300">Overdue</h3>
          <ul className="mt-4 space-y-3">
            {data.overdueTasks.map((t) => (
              <li
                key={t.id}
                className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4"
              >
                <Link
                  href={`/projects/${t.project.id}`}
                  className="font-semibold text-white hover:text-rose-200"
                >
                  {t.title}
                </Link>
                <p className="text-xs text-[var(--text-dim)]">
                  {t.project.name} · Due {formatDue(t.dueDate)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
