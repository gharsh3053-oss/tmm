"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/ui";
import { apiFetch } from "@/lib/client-fetch";
import { memberLabel, type ProjectMemberOption } from "@/lib/project-members";

type ProjectManageTabProps = {
  projectId: string;
  name: string;
  description: string | null;
  teamMembers: ProjectMemberOption[];
  onUpdated: () => void;
};

export function ProjectManageTab({
  projectId,
  name,
  description,
  teamMembers,
  onUpdated,
}: ProjectManageTabProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  async function updateProject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const form = new FormData(e.currentTarget);
    try {
      const res = await apiFetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: form.get("name"),
          description: form.get("description") || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setMessage("Project updated.");
      onUpdated();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function assignMember(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const form = new FormData(e.currentTarget);
    try {
      const res = await apiFetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        body: JSON.stringify({
          email: form.get("email"),
          role: form.get("role") || "MEMBER",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not assign member");
      (e.target as HTMLFormElement).reset();
      setMessage("Member assigned to this project.");
      onUpdated();
      window.dispatchEvent(new Event("tasktrack:member-added"));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Assign failed");
    } finally {
      setSaving(false);
    }
  }

  async function removeMember(memberId: string, memberName: string) {
    if (!confirm(`Remove ${memberName} from this project?`)) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await apiFetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not remove member");
      setMessage("Member removed.");
      onUpdated();
      window.dispatchEvent(new Event("tasktrack:member-added"));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject() {
    if (
      !confirm(
        `Delete "${name}"? All tasks and member assignments will be permanently removed.`
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      const res = await apiFetch(`/api/projects/${projectId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      router.push("/projects");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <p className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-muted)] px-4 py-2 text-sm text-[var(--accent-light)]">
          {message}
        </p>
      )}

      <section className="surface-card space-y-4 p-6">
        <h2 className="font-bold text-white">Update project</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Change the project name or description.
        </p>
        <form onSubmit={updateProject} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
              Project name
            </label>
            <input
              name="name"
              required
              defaultValue={name}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={description ?? ""}
              className="input-field resize-none"
              placeholder="Optional"
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </section>

      <section className="surface-card space-y-4 p-6">
        <h2 className="font-bold text-white">Assign project to members</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Add users by their signup email. They can then view this project and work on
          assigned tasks.
        </p>
        <form onSubmit={assignMember} className="flex flex-wrap gap-3">
          <input
            name="email"
            type="email"
            required
            placeholder="member@company.com"
            className="input-field min-w-[220px] flex-1 !mt-0"
          />
          <select name="role" className="input-field w-auto !mt-0">
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button type="submit" disabled={saving} className="btn-accent">
            Assign member
          </button>
        </form>

        <ul className="divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
          {teamMembers.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">
              No members yet. Assign someone above.
            </li>
          ) : (
            teamMembers.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-3 bg-[var(--surface-raised)] px-4 py-3"
              >
                <div>
                  <p className="font-medium text-white">{memberLabel(m)}</p>
                  <StatusBadge status={m.role} />
                </div>
                <button
                  type="button"
                  onClick={() => removeMember(m.id, m.user.name)}
                  disabled={saving}
                  className="text-sm text-rose-400 hover:text-rose-300"
                >
                  Remove
                </button>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="surface-card border-rose-500/20 p-6">
        <h2 className="font-bold text-rose-300">Delete project</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Permanently delete this project, all tasks, and member links. This cannot be undone.
        </p>
        <button
          type="button"
          onClick={deleteProject}
          disabled={deleting}
          className="btn-ghost mt-4 border border-rose-500/40 text-rose-300 hover:bg-rose-500/10"
        >
          {deleting ? "Deleting..." : "Delete project"}
        </button>
      </section>
    </div>
  );
}
