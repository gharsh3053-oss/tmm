"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type Project = { id: string; name: string };

type Member = {
  user: { id: string; name: string; email: string };
};

export function CreateTaskModal({
  open,
  defaultProjectId,
  onClose,
}: {
  open: boolean;
  defaultProjectId?: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setError("");
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setProjects(d.projects ?? []);
        const initial =
          defaultProjectId && d.projects?.some((p: Project) => p.id === defaultProjectId)
            ? defaultProjectId
            : d.projects?.[0]?.id ?? "";
        setProjectId(initial);
      })
      .catch((e) => setError(e.message));
  }, [open, defaultProjectId]);

  useEffect(() => {
    if (!open || !projectId) {
      setMembers([]);
      return;
    }

    setLoadingMembers(true);
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setMembers(d.project?.members ?? []);
      })
      .catch(() => setMembers([]))
      .finally(() => setLoadingMembers(false));
  }, [open, projectId]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!projectId) {
      setError("Select a project first");
      return;
    }

    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
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
      if (!res.ok) throw new Error(data.error || "Failed to create task");

      onClose();
      window.dispatchEvent(new Event("tasktrack:task-created"));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-task-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div className="surface-card relative z-10 w-full max-w-lg p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="create-task-title" className="text-lg font-bold text-white">
              Create Task
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Add a new task to your project
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              You need a project before creating tasks.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push("/projects");
              }}
              className="btn-primary"
            >
              Create Project
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                {error}
              </p>
            )}

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                Project
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
                className="input-field"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                Task Title
              </label>
              <input
                name="title"
                required
                className="input-field"
                placeholder="What needs to be done?"
                autoFocus
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                  Assignee
                </label>
                <select
                  name="assigneeId"
                  className="input-field"
                  disabled={loadingMembers}
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.user.id} value={m.user.id}>
                      {m.user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                  Due Date
                </label>
                <input name="dueDate" type="date" className="input-field" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                Description
              </label>
              <textarea
                name="description"
                rows={2}
                className="input-field resize-none"
                placeholder="Optional details"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-accent">
                {loading ? "Creating..." : "Create Task"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
