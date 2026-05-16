"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LoadingPulse, PageHeader, PriorityBadge, StatusBadge } from "@/components/ui";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  project: { id: string; name: string };
};

const statuses = ["TODO", "IN_PROGRESS", "DONE"] as const;

const statusLabels: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/tasks/my");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load tasks");
    setTasks(data.tasks ?? []);
  }, []);

  useEffect(() => {
    load()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [load]);

  async function updateStatus(taskId: string, status: string) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Could not update task");
      return;
    }
    await load();
    window.dispatchEvent(new Event("tasktrack:task-created"));
  }

  if (loading) return <LoadingPulse text="Loading your tasks..." />;
  if (error) {
    return (
      <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
        {error}
      </p>
    );
  }

  const open = tasks.filter((t) => t.status !== "DONE");
  const done = tasks.filter((t) => t.status === "DONE");

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Tasks"
        subtitle="Tasks assigned to you — update status (To Do, In Progress, Done)"
      />

      {tasks.length === 0 ? (
        <div className="surface-card p-10 text-center text-[var(--text-muted)]">
          No tasks assigned to you yet. Ask a project admin to assign work.
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--accent-light)]">
              Active ({open.length})
            </h2>
            {open.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">All assigned tasks are done.</p>
            ) : (
              <ul className="space-y-3">
                {open.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onStatusChange={updateStatus}
                  />
                ))}
              </ul>
            )}
          </section>

          {done.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Completed ({done.length})
              </h2>
              <ul className="space-y-3">
                {done.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onStatusChange={updateStatus}
                  />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function TaskRow({
  task,
  onStatusChange,
}: {
  task: Task;
  onStatusChange: (id: string, status: string) => void;
}) {
  const overdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "DONE";

  return (
    <li
      className={`surface-card flex flex-wrap items-center justify-between gap-4 p-4 ${
        overdue ? "border-rose-500/30" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/projects/${task.project.id}`}
            className="font-semibold text-white hover:text-[var(--accent-light)]"
          >
            {task.title}
          </Link>
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </div>
        <p className="mt-1 text-xs text-[var(--text-dim)]">
          {task.project.name}
          {task.dueDate &&
            ` · Due ${new Date(task.dueDate).toLocaleDateString()}`}
          {overdue && <span className="ml-1 text-rose-400">· Overdue</span>}
        </p>
        {task.description && (
          <p className="mt-2 text-sm text-[var(--text-muted)]">{task.description}</p>
        )}
      </div>
      <select
        value={task.status}
        onChange={(e) => onStatusChange(task.id, e.target.value)}
        className="input-field !mt-0 w-auto min-w-[140px] py-2 text-sm"
        aria-label={`Update status for ${task.title}`}
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {statusLabels[s]}
          </option>
        ))}
      </select>
    </li>
  );
}
