"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/client-fetch";
import { memberLabel, parseProjectMembers, type ProjectMemberOption } from "@/lib/project-members";

type Project = { id: string; name: string };

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
  const [members, setMembers] = useState<ProjectMemberOption[]>([]);
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [error, setError] = useState("");

  const loadMembers = useCallback(async (pid: string) => {
    setLoadingMembers(true);
    try {
      const res = await apiFetch(`/api/projects/${pid}/members`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load members");
      setMembers(parseProjectMembers(data.members));
    } catch {
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    setError("");
    apiFetch("/api/projects")
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
    loadMembers(projectId);
  }, [open, projectId, loadMembers]);

  useEffect(() => {
    if (!open) return;
    function onMemberAdded() {
      if (projectId) loadMembers(projectId);
    }
    window.addEventListener("tasktrack:member-added", onMemberAdded);
    return () => window.removeEventListener("tasktrack:member-added", onMemberAdded);
  }, [open, projectId, loadMembers]);

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
      const res = await apiFetch(`/api/projects/${projectId}/tasks`, {
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
              Assign to any member on the selected project
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

            <div className="grid gap-4 sm:grid-cols-3">
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
                      {memberLabel(m)}
                    </option>
                  ))}
                </select>
                {!loadingMembers && members.length <= 1 && (
                  <p className="mt-1 text-xs text-amber-400/90">
                    Add more people on the project Team tab first (they must sign up).
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                  Priority
                </label>
                <select name="priority" className="input-field" defaultValue="MEDIUM">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
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
