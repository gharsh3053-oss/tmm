"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useCreateTask } from "@/components/dashboard/CreateTaskContext";
import type { TeamMember } from "@/components/dashboard/TeamTable";
import {
  DeadlinePanel,
  MainGoalsPanel,
  PerformancePanel,
  TaskProgressPanel,
  TeamAssignmentsPanel,
} from "@/components/dashboard/VirtusWidgets";
import { IconRefresh } from "@/components/dashboard/icons";
import { LoadingPulse } from "@/components/ui";

type TeamProgressData = {
  stats: {
    totalMembers: number;
    submittedCount: number;
    notSubmittedCount: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
  };
  projects: Array<{ id: string; name: string }>;
  members: TeamMember[];
};

export default function DashboardPage() {
  const [data, setData] = useState<TeamProgressData | null>(null);
  const [error, setError] = useState("");
  const [projectId, setProjectId] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [completing, setCompleting] = useState(false);
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  }

  async function handleMarkComplete() {
    if (!data?.stats.pendingTasks) return;
    if (
      !confirm(
        `Mark ${data.stats.pendingTasks} open task(s) as complete? This updates tasks you can edit (your assignments, or all tasks if you are a project admin).`
      )
    ) {
      return;
    }

    setCompleting(true);
    setError("");
    try {
      const res = await fetch("/api/tasks/bulk-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectId ? { projectId } : {}),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to complete tasks");

      window.dispatchEvent(new Event("tasktrack:task-created"));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to complete tasks");
    } finally {
      setCompleting(false);
    }
  }

  if (error) {
    return (
      <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
        {error}
      </p>
    );
  }

  if (!data) return <LoadingPulse text="Loading dashboard..." />;

  const completionRate =
    data.stats.totalTasks === 0
      ? 0
      : Math.round((data.stats.completedTasks / data.stats.totalTasks) * 100);

  return (
    <div className="space-y-6">
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
        <Link href="/projects" className="btn-ghost inline-flex items-center gap-2">
          + New Project
        </Link>
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <TaskProgressPanel
            completed={data.stats.completedTasks}
            total={data.stats.totalTasks}
            onCreateTask={() => openCreateTask(projectId ? { projectId } : undefined)}
          />
        </div>
        <div className="lg:col-span-7">
          <PerformancePanel
            completionRate={completionRate}
            submitted={data.stats.submittedCount}
            totalMembers={data.stats.totalMembers}
          />
        </div>
        <div className="lg:col-span-4">
          <MainGoalsPanel members={data.members} />
        </div>
        <div className="lg:col-span-5">
          <TeamAssignmentsPanel members={data.members} />
        </div>
        <div className="lg:col-span-3">
          <DeadlinePanel
            completionRate={completionRate}
            pendingCount={data.stats.pendingTasks}
            onMarkComplete={handleMarkComplete}
            completing={completing}
          />
        </div>
      </div>

    </div>
  );
}
