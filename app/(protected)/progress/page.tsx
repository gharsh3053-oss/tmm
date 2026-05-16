"use client";

import { useCallback, useEffect, useState } from "react";
import { useCreateTask } from "@/components/dashboard/CreateTaskContext";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TeamTable, type TeamMember } from "@/components/dashboard/TeamTable";
import { IconClock, IconRefresh, IconUsers } from "@/components/dashboard/icons";
import { LoadingPulse } from "@/components/ui";

type TeamProgressData = {
  stats: {
    totalMembers: number;
    submittedCount: number;
    notSubmittedCount: number;
    totalTasks: number;
    completedTasks: number;
  };
  projects: Array<{ id: string; name: string }>;
  members: TeamMember[];
};

export default function ProgressPage() {
  const [data, setData] = useState<TeamProgressData | null>(null);
  const [error, setError] = useState("");
  const [projectId, setProjectId] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { openCreateTask } = useCreateTask();

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (projectId) params.set("projectId", projectId);
    const res = await fetch(`/api/team-progress?${params}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to load");
    setData(json);
  }, [projectId]);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  useEffect(() => {
    function onTaskCreated() {
      load().catch((e) => setError(e.message));
    }
    window.addEventListener("tasktrack:task-created", onTaskCreated);
    return () => window.removeEventListener("tasktrack:task-created", onTaskCreated);
  }, [load]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }

  if (error) {
    return (
      <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
        {error}
      </p>
    );
  }

  if (!data) return <LoadingPulse text="Loading team progress..." />;

  const completionRate =
    data.stats.totalTasks === 0
      ? 0
      : Math.round((data.stats.completedTasks / data.stats.totalTasks) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Team Progress</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Track submissions and completion across your team
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="input-field !mt-0 w-auto min-w-[160px] rounded-2xl py-2 text-sm"
          >
            <option value="">All Projects</option>
            {data.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-ghost inline-flex items-center gap-2 !py-2"
          >
            <IconRefresh className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => openCreateTask(projectId ? { projectId } : undefined)}
            className="btn-primary inline-flex items-center gap-2"
          >
            + Create Task
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Team Members"
          value={data.stats.totalMembers}
          accent="amber"
          icon={<IconUsers className="h-5 w-5" />}
        />
        <MetricCard
          label="Submitted"
          value={data.stats.submittedCount}
          accent="emerald"
          icon={<IconUsers className="h-5 w-5" />}
        />
        <MetricCard
          label="Not Submitted"
          value={data.stats.notSubmittedCount}
          accent="rose"
          icon={<IconUsers className="h-5 w-5" />}
        />
        <MetricCard
          label="Completion"
          value={`${completionRate}%`}
          accent="indigo"
          icon={<IconClock className="h-5 w-5" />}
        />
      </div>

      <TeamTable members={data.members} />
    </div>
  );
}
