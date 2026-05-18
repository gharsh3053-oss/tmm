"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LoadingPulse, PageHeader, StatusBadge } from "@/components/ui";
import { apiFetch } from "@/lib/client-fetch";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  systemRole: string;
  isActive: boolean;
  inactive: boolean;
  lastActiveAt: string | null;
  createdAt: string;
  projectCount: number;
  assignedTaskCount: number;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const res = await apiFetch("/api/admin/users");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load users");
    setUsers(data.users ?? []);
  }, []);

  useEffect(() => {
    load()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [load]);

  async function updateUser(
    id: string,
    patch: { systemRole?: string; isActive?: boolean; name?: string }
  ) {
    setMessage("");
    const res = await apiFetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Update failed");
      return;
    }
    setMessage("User updated.");
    await load();
  }

  async function deleteUser(user: AdminUser) {
    if (
      !confirm(
        `Permanently delete ${user.name} (${user.email})? This cannot be undone.`
      )
    ) {
      return;
    }
    const res = await apiFetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Delete failed");
      return;
    }
    setMessage("Inactive account deleted.");
    await load();
  }

  if (loading) return <LoadingPulse text="Loading users..." />;
  if (error) {
    return (
      <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
        {error}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage users"
        subtitle="Roles, permissions, deactivate accounts, and delete inactive users"
        action={
          <Link href="/admin" className="btn-ghost">
            ← Monitor
          </Link>
        }
      />

      {message && (
        <p className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-muted)] px-4 py-2 text-sm text-[var(--accent-light)]">
          {message}
        </p>
      )}

      <div className="surface-card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-raised)] text-xs uppercase tracking-wider text-[var(--text-dim)]">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">System role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Projects</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[var(--surface-hover)]">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{u.name}</p>
                  <p className="text-xs text-[var(--text-dim)]">{u.email}</p>
                  {u.inactive && (
                    <span className="mt-1 inline-block text-xs text-amber-400">
                      Inactive (30+ days or deactivated)
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={u.systemRole}
                    onChange={(e) =>
                      updateUser(u.id, {
                        systemRole: e.target.value as "USER" | "PLATFORM_ADMIN",
                      })
                    }
                    className="input-field !mt-0 w-auto py-1.5 text-xs"
                  >
                    <option value="USER">User</option>
                    <option value="PLATFORM_ADMIN">Platform admin</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-2">
                    <StatusBadge status={u.isActive ? "DONE" : "TODO"} />
                    <span className="text-xs text-[var(--text-dim)]">
                      {u.isActive ? "Active" : "Deactivated"}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateUser(u.id, { isActive: !u.isActive })}
                      className="text-left text-xs text-[var(--accent-light)] hover:underline"
                    >
                      {u.isActive ? "Deactivate" : "Reactivate"}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)]">
                  {u.projectCount} · {u.assignedTaskCount} tasks
                </td>
                <td className="px-4 py-3">
                  {u.inactive ? (
                    <button
                      type="button"
                      onClick={() => deleteUser(u)}
                      className="text-xs text-rose-400 hover:text-rose-300"
                    >
                      Delete account
                    </button>
                  ) : (
                    <span className="text-xs text-[var(--text-dim)]">
                      Delete when inactive
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="surface-card p-4 text-sm text-[var(--text-muted)]">
        <p className="font-semibold text-white">Permissions</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>
            <strong>Platform admin</strong> — manage all users, monitor every project/task
          </li>
          <li>
            <strong>User</strong> — normal access; project Admin/Member roles are set per project
          </li>
          <li>
            <strong>Delete</strong> — only for inactive accounts (deactivated or 30+ days without
            activity)
          </li>
        </ul>
        <p className="mt-3 text-xs text-[var(--text-dim)]">
          Set <code className="text-[var(--accent-light)]">ADMIN_EMAILS</code> in .env to auto-promote
          emails on signup/login.
        </p>
      </div>
    </div>
  );
}
