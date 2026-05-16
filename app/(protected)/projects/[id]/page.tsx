"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { LoadingPulse, StatusBadge } from "@/components/ui";

type Member = {
  id: string;
  role: string;
  user: { id: string; name: string; email: string };
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  assignee: { id: string; name: string } | null;
};

type Project = {
  id: string;
  name: string;
  description: string | null;
  myRole: string;
  members: Member[];
  tasks: Task[];
};

const statuses = ["TODO", "IN_PROGRESS", "DONE"] as const;

const statusLabels: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"tasks" | "team">("tasks");

  const load = useCallback(async () => {
    const res = await fetch(`/api/projects/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setProject(data.project);
  }, [id]);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  const isAdmin = project?.myRole === "ADMIN";

  async function addTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const res = await fetch(`/api/projects/${id}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        description: form.get("description") || undefined,
        assigneeId: form.get("assigneeId") || null,
        dueDate: form.get("dueDate")
          ? new Date(form.get("dueDate") as string).toISOString()
          : null,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }
    formEl.reset();
    await load();
  }

  async function updateTaskStatus(taskId: string, status: string) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error);
      return;
    }
    await load();
  }

  async function deleteTask(taskId: string) {
    if (!confirm("Delete this task? This cannot be undone.")) return;
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    await load();
  }

  async function addMember(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const res = await fetch(`/api/projects/${id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        role: form.get("role"),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }
    formEl.reset();
    await load();
  }

  async function removeMember(memberId: string) {
    if (!confirm("Remove this member from the project?")) return;
    await fetch(`/api/projects/${id}/members/${memberId}`, { method: "DELETE" });
    await load();
  }

  async function deleteProject() {
    if (!confirm("Delete this entire project? All tasks will be removed.")) return;
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/projects");
  }

  if (error) {
    return (
      <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
        {error}
      </p>
    );
  }
  if (!project) return <LoadingPulse text="Loading project..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#c9a227]">Project</p>
          <h1 className="mt-1 text-3xl font-bold text-white">{project.name}</h1>
          {project.description && (
            <p className="mt-2 text-[var(--text-muted)]">{project.description}</p>
          )}
          <div className="mt-3">
            <StatusBadge status={project.myRole} />
          </div>
        </div>
        {isAdmin && (
          <button onClick={deleteProject} className="btn-ghost border-rose-500/30 text-rose-300">
            Delete Project
          </button>
        )}
      </div>

      <div className="flex gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] p-1 w-fit">
        {(["tasks", "team"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              tab === t
                ? "bg-indigo-600 text-white shadow-md"
                : "text-[var(--text-muted)] hover:text-white"
            }`}
          >
            {t === "tasks" ? "Tasks" : "Team"}
          </button>
        ))}
      </div>

      {tab === "tasks" && (
        <div className="space-y-6">
          <form onSubmit={addTask} className="surface-card space-y-4 p-6">
            <h2 className="font-bold text-white">Add Task</h2>
            <input
              name="title"
              placeholder="Task title"
              required
              className="input-field"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <select name="assigneeId" className="input-field !mt-0">
                <option value="">Unassigned</option>
                {project.members.map((m) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.name}
                  </option>
                ))}
              </select>
              <input name="dueDate" type="date" className="input-field !mt-0" />
            </div>
            <textarea
              name="description"
              placeholder="Description (optional)"
              rows={2}
              className="input-field resize-none"
            />
            <button type="submit" className="btn-primary">
              Add Task
            </button>
          </form>

          {project.tasks.length === 0 ? (
            <div className="surface-card p-10 text-center text-[var(--text-muted)]">
              No tasks yet. Add one above to get started.
            </div>
          ) : (
            <ul className="space-y-3">
              {project.tasks.map((task) => (
                <li
                  key={task.id}
                  className="surface-card surface-card-hover flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div>
                    <p className="font-semibold text-white">{task.title}</p>
                    <p className="text-xs text-[var(--text-dim)]">
                      {task.assignee ? task.assignee.name : "Unassigned"}
                      {task.dueDate &&
                        ` · Due ${new Date(task.dueDate).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      className="input-field !mt-0 w-auto py-1.5 text-xs"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {statusLabels[s]}
                        </option>
                      ))}
                    </select>
                    {isAdmin && (
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-sm text-rose-400 hover:text-rose-300"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "team" && (
        <div className="space-y-6">
          {isAdmin && (
            <form onSubmit={addMember} className="surface-card space-y-4 p-6">
              <h2 className="font-bold text-white">Invite Team Member</h2>
              <p className="text-xs text-[var(--text-dim)]">User must already have an account</p>
              <div className="flex flex-wrap gap-3">
                <input
                  name="email"
                  type="email"
                  placeholder="colleague@company.com"
                  required
                  className="input-field min-w-[200px] flex-1 !mt-0"
                />
                <select name="role" className="input-field w-auto !mt-0">
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <button type="submit" className="btn-primary">
                  Add Member
                </button>
              </div>
            </form>
          )}

          <ul className="surface-card divide-y divide-[var(--border-subtle)] overflow-hidden">
            {project.members.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-[var(--surface-hover)]"
              >
                <div>
                  <p className="font-semibold text-white">{m.user.name}</p>
                  <p className="text-sm text-[var(--text-dim)]">{m.user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={m.role} />
                  {isAdmin && (
                    <button
                      onClick={() => removeMember(m.id)}
                      className="text-sm text-rose-400 hover:text-rose-300"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
