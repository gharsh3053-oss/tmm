"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IconCheck } from "./icons";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  progressPercent: number;
  submissionStatus: "SUBMITTED" | "PENDING" | "IN_PROGRESS";
  activeTask: string | null;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TeamTable({ members }: { members: TeamMember[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || m.submissionStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [members, search, statusFilter]);

  return (
    <div className="surface-card overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border-subtle)] p-4">
        <input
          type="search"
          placeholder="Search team members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field !mt-0 min-w-[200px] flex-1 max-w-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field !mt-0 w-auto py-2 text-xs"
        >
          <option value="ALL">Status: All</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[10px] font-semibold uppercase tracking-wider text-[var(--text-dim)]">
              <th className="px-5 py-3">Member</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Active Task</th>
              <th className="px-5 py-3">Progress</th>
              <th className="px-5 py-3">Tasks</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-center">Review</th>
              <th className="px-5 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-[var(--text-muted)]">
                  No team members match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((m) => (
                <tr
                  key={m.id}
                  className="transition hover:bg-[var(--surface-hover)]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-xs font-bold text-indigo-300">
                        {getInitials(m.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{m.name}</p>
                        <p className="text-xs text-[var(--text-dim)]">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="badge bg-[var(--gold-muted)] text-amber-300/90">
                      {m.role === "ADMIN" ? "Lead" : "Member"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="max-w-[180px] truncate text-[var(--text-muted)]">
                      {m.activeTask ?? "—"}
                    </p>
                    <p className="text-[10px] text-[var(--text-dim)]">{m.projectName}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--bg)]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] transition-all"
                          style={{ width: `${m.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium tabular-nums text-[var(--text-muted)]">
                        {m.progressPercent}%
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-[var(--text-dim)]">
                      {m.completedTasks} / {m.totalTasks} completed
                    </p>
                  </td>
                  <td className="px-5 py-4 tabular-nums text-[var(--text-muted)]">
                    {m.inProgressTasks} active
                  </td>
                  <td className="px-5 py-4">
                    <SubmissionBadge status={m.submissionStatus} />
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-dim)] transition hover:border-[var(--accent)]/40 hover:text-[var(--accent-light)]"
                      aria-label="Review"
                    >
                      <IconCheck className="h-4 w-4" />
                    </button>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <Link
                      href="/projects"
                      className="text-xs font-semibold text-[var(--accent-light)] hover:text-[var(--accent-hover)]"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SubmissionBadge({
  status,
}: {
  status: TeamMember["submissionStatus"];
}) {
  const styles = {
    SUBMITTED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    PENDING: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
    IN_PROGRESS: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  };
  const labels = {
    SUBMITTED: "Submitted",
    PENDING: "Pending",
    IN_PROGRESS: "In Progress",
  };

  return (
    <span className={`badge border ${styles[status]}`}>{labels[status]}</span>
  );
}
