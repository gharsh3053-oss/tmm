"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState, Suspense } from "react";
import { ProjectManageTab } from "@/components/projects/ProjectManageTab";
import { LoadingPulse, PriorityBadge, StatusBadge } from "@/components/ui";
import { apiFetch } from "@/lib/client-fetch";
import { memberLabel, parseProjectMembers, type ProjectMemberOption } from "@/lib/project-members";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  assignee: { id: string; name: string } | null;
};

type Project = {
  id: string;
  name: string;
  description: string | null;
  myRole: string;
  currentUserId: string;
  canManageTasks: boolean;
  canManageMembers: boolean;
  tasks: Task[];
};

const statuses = ["TODO", "IN_PROGRESS", "DONE"] as const;

const statusLabels: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

function ProjectDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [project, setProject] = useState<Project | null>(null);
  const [teamMembers, setTeamMembers] = useState<ProjectMemberOption[]>([]);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"tasks" | "manage">("tasks");

  const isAdmin = project?.canManageMembers ?? false;

  const load = useCallback(async () => {
    const [projectRes, membersRes] = await Promise.all([
      apiFetch(`/api/projects/${id}`),
      apiFetch(`/api/projects/${id}/members`),
    ]);
    const data = await projectRes.json();
    if (!projectRes.ok) throw new Error(data.error);
    setProject(data.project);

    const membersData = await membersRes.json();
    if (membersRes.ok) {
      setTeamMembers(parseProjectMembers(membersData.members));
    }
  }, [id]);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  useEffect(() => {
    if (!project) return;
    const t = searchParams.get("tab");
    if (t === "manage" && project.canManageMembers) setTab("manage");
    else setTab("tasks");
  }, [searchParams, project]);

  function setTabAndUrl(next: "tasks" | "manage") {
    setTab(next);
    const url = next === "manage" ? `/projects/${id}?tab=manage` : `/projects/${id}`;
    router.replace(url, { scroll: false });
  }

  async function addTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const res = await apiFetch(`/api/projects/${id}/tasks`, {
      method: "POST",
      body: JSON.stringify({
        title: form.get("title"),
        description: form.get("description") || undefined,
        assigneeId: form.get("assigneeId") || null,
        dueDate: form.get("dueDate")
          ? new Date(form.get("dueDate") as string).toISOString()
          : null,
        priority: form.get("priority") || "MEDIUM",
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
    const res = await apiFetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
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
    const res = await apiFetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Could not delete task");
    }
    await load();
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
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent-light)]">
            Project
          </p>
          <h1 className="mt-1 text-3xl font-bold text-white">{project.name}</h1>
          {project.description && (
            <p className="mt-2 text-[var(--text-muted)]">{project.description}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={project.myRole} />
            <span className="text-xs text-[var(--text-dim)]">
              {teamMembers.length} member{teamMembers.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setTabAndUrl("manage")}
            className="btn-primary"
          >
            Manage project
          </button>
        )}
      </div>

      <div className="flex gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] p-1 w-fit">
        <button
          type="button"
          onClick={() => setTabAndUrl("tasks")}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
            tab === "tasks"
              ? "bg-[var(--accent)] text-white shadow-md"
              : "text-[var(--text-muted)] hover:text-white"
          }`}
        >
          Tasks
        </button>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setTabAndUrl("manage")}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              tab === "manage"
                ? "bg-[var(--accent)] text-white shadow-md"
                : "text-[var(--text-muted)] hover:text-white"
            }`}
          >
            Update & assign
          </button>
        )}
      </div>

      {tab === "manage" && isAdmin && (
        <ProjectManageTab
          projectId={id}
          name={project.name}
          description={project.description}
          teamMembers={teamMembers}
          onUpdated={load}
        />
      )}

      {tab === "tasks" && (
        <div className="space-y-6">
          {isAdmin ? (
            <form onSubmit={addTask} className="surface-card space-y-4 p-6">
              <h2 className="font-bold text-white">Add Task</h2>
              <input
                name="title"
                placeholder="Task title"
                required
                className="input-field"
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                    Assignee
                  </label>
                  <select name="assigneeId" className="input-field !mt-0">
                    <option value="">Unassigned</option>
                    {teamMembers.map((m) => (
                      <option key={m.user.id} value={m.user.id}>
                        {memberLabel(m)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                    Priority
                  </label>
                  <select name="priority" className="input-field !mt-0" defaultValue="MEDIUM">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                    Due date
                  </label>
                  <input name="dueDate" type="date" className="input-field !mt-0" />
                </div>
              </div>
              {teamMembers.length <= 1 && (
                <p className="text-xs text-amber-400/90">
                  Assign members in the <strong>Update & assign</strong> tab first.
                </p>
              )}
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
          ) : (
            <p className="surface-card px-4 py-3 text-sm text-[var(--text-muted)]">
              You only see tasks assigned to you. Update status on{" "}
              <a href="/my-tasks" className="text-[var(--accent-light)] hover:underline">
                My Tasks
              </a>
              .
            </p>
          )}

          {project.tasks.length === 0 ? (
            <div className="surface-card p-10 text-center text-[var(--text-muted)]">
              {isAdmin
                ? "No tasks yet. Add one above."
                : "No tasks assigned to you in this project."}
            </div>
          ) : (
            <ul className="space-y-3">
              {project.tasks.map((task) => (
                <li
                  key={task.id}
                  className="surface-card surface-card-hover flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-white">{task.title}</p>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    <p className="text-xs text-[var(--text-dim)]">
                      {task.assignee ? task.assignee.name : "Unassigned"}
                      {task.dueDate &&
                        ` · Due ${new Date(task.dueDate).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin || task.assignee?.id === project.currentUserId ? (
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
                    ) : (
                      <StatusBadge status={task.status} />
                    )}
                    {isAdmin && (
                      <button
                        type="button"
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
    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={<LoadingPulse text="Loading project..." />}>
      <ProjectDetailContent />
    </Suspense>
  );
}
