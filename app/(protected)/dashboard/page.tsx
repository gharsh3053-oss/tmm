"use client";

import Link from "next/link";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { useCreateTask } from "@/components/dashboard/CreateTaskContext";
import { useUserRole } from "@/components/dashboard/UserRoleContext";
import { PageHeader } from "@/components/ui";

export default function DashboardPage() {
  const { openCreateTask } = useCreateTask();
  const { isAdmin } = useUserRole();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Total tasks, status breakdown, workload per user, and overdue items"
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/projects" className="btn-ghost">
              Projects
            </Link>
            <Link href="/my-tasks" className="btn-ghost">
              My Tasks
            </Link>
            {isAdmin && (
              <button
                type="button"
                onClick={() => openCreateTask()}
                className="btn-primary"
              >
                + Create Task
              </button>
            )}
          </div>
        }
      />

      <DashboardStats />
    </div>
  );
}
