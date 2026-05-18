"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoadingPulse, PageHeader, StatusBadge } from "@/components/ui";
import { apiFetch } from "@/lib/client-fetch";

type Overview = {
  stats: {
    users: number;
    inactiveUsers: number;
    projects: number;
    tasks: number;
    todo: number;
    inProgress: number;
    done: number;
    overdue: number;
  };
  projects: Array<{
    id: string;
    name: string;
    description: string | null;
    memberCount: number;
    taskCount: number;
    members: string[];
    updatedAt: string;
  }>;
  recentTasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: string | null;
    project: { name: string };
    assignee: { name: string } | null;
  }>;
};

export default function AdminMonitorPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/admin/overview")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
        {error}
      </p>
    );
  }

  if (!data) return <LoadingPulse text="Loading platform overview..." />;

  const { stats, projects, recentTasks } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform admin"
        subtitle="Monitor all projects and tasks across the system"
        action={
          <Link href="/admin/users" className="btn-primary">
            Manage users
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {[
          { label: "Users", value: stats.users },
          { label: "Inactive", value: stats.inactiveUsers, warn: true },
          { label: "Projects", value: stats.projects },
          { label: "Tasks", value: stats.tasks },
          { label: "To Do", value: stats.todo },
          { label: "In Progress", value: stats.inProgress },
          { label: "Done", value: stats.done },
          { label: "Overdue", value: stats.overdue, warn: true },
        ].map((item) => (
          <div
            key={item.label}
            className={`surface-card p-3 ${item.warn ? "border-amber-500/30" : ""}`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-dim)]">
              {item.label}
            </p>
            <p
              className={`mt-1 text-xl font-bold tabular-nums ${
                item.warn ? "text-amber-400" : "text-white"
              }`}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">All projects</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {projects.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No projects yet.</p>
          ) : (
            projects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="surface-card surface-card-hover block p-4"
              >
                <p className="font-semibold text-white">{p.name}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {p.memberCount} members · {p.taskCount} tasks
                </p>
                {p.members.length > 0 && (
                  <p className="mt-2 text-xs text-[var(--text-dim)]">
                    Team: {p.members.join(", ")}
                    {p.memberCount > 3 ? "…" : ""}
                  </p>
                )}
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Recent tasks (all projects)</h2>
        <div className="surface-card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-raised)] text-xs uppercase tracking-wider text-[var(--text-dim)]">
              <tr>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Assignee</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {recentTasks.map((t) => (
                <tr key={t.id} className="hover:bg-[var(--surface-hover)]">
                  <td className="px-4 py-3 font-medium text-white">{t.title}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{t.project.name}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">
                    {t.assignee?.name ?? "Unassigned"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
