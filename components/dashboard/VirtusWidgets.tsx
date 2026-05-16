"use client";

import type { TeamMember } from "./TeamTable";

function ProgressBar({
  value,
  active = true,
}: {
  value: number;
  active?: boolean;
}) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          active ? "bg-[var(--accent)]" : "bg-[var(--border)]"
        }`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function CircularProgress({ percent }: { percent: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="var(--bg-elevated)"
          strokeWidth="10"
        />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-bold text-white">{percent}%</p>
        <p className="text-xs text-[var(--text-dim)]">Complete</p>
      </div>
    </div>
  );
}

export function TaskProgressPanel({
  completed,
  total,
  onCreateTask,
}: {
  completed: number;
  total: number;
  onCreateTask: () => void;
}) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="bento-card flex h-full flex-col">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Task progress</h2>
          <p className="mt-1 text-3xl font-bold text-white">
            {completed}
            <span className="text-lg text-[var(--text-dim)]">/{total}</span>
          </p>
        </div>
        <span className="rounded-2xl bg-[var(--accent-muted)] px-3 py-1 text-sm font-semibold text-[var(--accent-light)]">
          {pct}%
        </span>
      </div>

      <div className="mt-5 space-y-3">
        <div className="rounded-2xl bg-[var(--bg-elevated)] p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-white">New tasks</p>
              <p className="text-xs text-[var(--text-dim)]">{total - completed} remaining</p>
            </div>
            <span className="text-lg font-bold text-[var(--accent-light)]">{pct}%</span>
          </div>
          <ProgressBar value={pct} />
          <button type="button" onClick={onCreateTask} className="btn-soft mt-3 w-full">
            Start now
          </button>
        </div>

        <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent-muted)] p-4">
          <p className="text-xs font-medium text-[var(--accent-light)]">Quick action</p>
          <p className="mt-1 text-sm text-white">Add a task to keep momentum going</p>
          <button type="button" onClick={onCreateTask} className="btn-primary mt-3 w-full">
            + Create Task
          </button>
        </div>
      </div>
    </div>
  );
}

export function PerformancePanel({
  completionRate,
  submitted,
  totalMembers,
}: {
  completionRate: number;
  submitted: number;
  totalMembers: number;
}) {
  const bars = [
    76,
    completionRate,
    Math.min(100, Math.round((submitted / Math.max(totalMembers, 1)) * 100)),
  ];
  const heights = [45, 72, 58, 85, 65, 90, 70, completionRate];

  return (
    <div className="bento-card flex h-full flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Awesome performance</h2>
          <p className="text-xs text-[var(--text-dim)]">Team delivery overview</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="rounded-xl bg-[var(--surface-raised)] px-3 py-1.5 text-[var(--text-muted)]">
            All time
          </span>
          <span className="rounded-xl bg-[var(--accent-muted)] px-3 py-1.5 font-semibold text-[var(--accent-light)]">
            Weekly
          </span>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        {bars.map((v, i) => (
          <div
            key={i}
            className={`flex-1 rounded-2xl px-3 py-2 text-center ${
              i === 1
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
            }`}
          >
            <p className="text-lg font-bold">{v}%</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex min-h-[120px] flex-1 items-end gap-1.5">
        {heights.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-lg bg-gradient-to-t from-[var(--accent)] to-[var(--accent-light)] opacity-90"
            style={{ height: `${h}%`, minHeight: "8px" }}
          />
        ))}
      </div>
      <div className="mt-3 flex justify-between text-[10px] text-[var(--text-dim)]">
        <span>High performance</span>
        <span className="text-[var(--accent-light)]">● Current</span>
      </div>
    </div>
  );
}

export function MainGoalsPanel({ members }: { members: TeamMember[] }) {
  const goals =
    members.length > 0
      ? members.slice(0, 4).map((m, i) => ({
          id: m.id,
          label: m.activeTask ?? `${m.name} · ${m.projectName}`,
          progress: m.progressPercent,
          active: i % 2 === 0,
        }))
      : [
          { id: "demo-1", label: "Dashboard design", progress: 64, active: true },
          { id: "demo-2", label: "Motion design", progress: 87, active: false },
        ];

  return (
    <div className="bento-card h-full">
      <h2 className="text-lg font-bold text-white">Main goal</h2>
      <div className="mt-5 space-y-5">
        {goals.map((g) => (
          <div key={g.id}>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">{g.label}</span>
              <span className="font-semibold text-white">{g.progress}%</span>
            </div>
            <ProgressBar value={g.progress} active={g.active} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TeamAssignmentsPanel({ members }: { members: TeamMember[] }) {
  const items = members.slice(0, 5);

  return (
    <div className="bento-card h-full">
      <h2 className="text-lg font-bold text-white">Assignment for all team</h2>
      <ul className="mt-5 space-y-4">
        {items.length === 0 ? (
          <li className="text-sm text-[var(--text-dim)]">No assignments yet</li>
        ) : (
          items.map((m) => (
            <li key={m.id} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-muted)] text-xs font-bold text-[var(--accent-light)]">
                {m.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {m.activeTask ?? "No active task"}
                </p>
                <p className="text-xs text-[var(--text-dim)]">{m.name}</p>
              </div>
              <span
                className={`badge shrink-0 ${
                  m.submissionStatus === "SUBMITTED"
                    ? "bg-[var(--accent-muted)] text-[var(--accent-light)]"
                    : m.submissionStatus === "IN_PROGRESS"
                      ? "bg-[var(--accent)]/20 text-[var(--accent-light)]"
                      : "bg-[var(--surface-raised)] text-[var(--text-dim)]"
                }`}
              >
                {m.submissionStatus === "SUBMITTED"
                  ? "Done"
                  : m.submissionStatus === "IN_PROGRESS"
                    ? "Progress"
                    : "Pending"}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export function DeadlinePanel({
  completionRate,
  pendingCount,
  onMarkComplete,
  completing = false,
}: {
  completionRate: number;
  pendingCount: number;
  onMarkComplete: () => void;
  completing?: boolean;
}) {
  const hasPending = pendingCount > 0;
  return (
    <div className="bento-card flex h-full flex-col items-center justify-between text-center">
      <h2 className="w-full text-left text-lg font-bold text-white">Deadline</h2>
      <CircularProgress percent={completionRate} />
      <div className="w-full rounded-2xl bg-[var(--bg-elevated)] p-4">
        <p className="text-2xl font-bold text-white">⚡ {pendingCount}</p>
        <p className="text-xs text-[var(--text-dim)]">
          {hasPending ? "open tasks remaining" : "all tasks complete"}
        </p>
      </div>
      <button
        type="button"
        onClick={onMarkComplete}
        disabled={!hasPending || completing}
        className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        {completing
          ? "Completing..."
          : hasPending
            ? "Mark as complete"
            : "All done"}
      </button>
    </div>
  );
}
