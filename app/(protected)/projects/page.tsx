"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useCreateTask } from "@/components/dashboard/CreateTaskContext";
import { useUserRole } from "@/components/dashboard/UserRoleContext";
import { LoadingPulse, PageHeader, StatusBadge } from "@/components/ui";
import { apiFetch } from "@/lib/client-fetch";

type Project = {
  id: string;
  name: string;
  description: string | null;
  role: string;
  memberCount: number;
  taskCount: number;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { openCreateTask } = useCreateTask();
  const { isAdmin } = useUserRole();

  async function load() {
    const res = await apiFetch("/api/projects");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setProjects(data.projects);
  }

  useEffect(() => {
    load()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function createProject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const res = await apiFetch("/api/projects", {
      method: "POST",
      body: JSON.stringify({
        name: form.get("name"),
        description: form.get("description") || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }
    formEl.reset();
    setShowForm(false);
    if (data.project?.id) {
      window.location.href = `/projects/${data.project.id}`;
    } else {
      await load();
    }
  }

  if (loading) return <LoadingPulse text="Loading projects..." />;
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
        title="Projects"
        subtitle={
          isAdmin
            ? "Create projects (you become Admin), add/remove members, manage tasks"
            : "Projects you have been assigned to as a team member"
        }
        action={
          <div className="flex flex-wrap gap-2">
            {isAdmin && (
              <button type="button" onClick={() => openCreateTask()} className="btn-accent">
                + Create Task
              </button>
            )}
            <button type="button" onClick={() => setShowForm(!showForm)} className="btn-primary">
              {showForm ? "Cancel" : "+ New Project"}
            </button>
          </div>
        }
      />

      {showForm && (
        <form onSubmit={createProject} className="surface-card space-y-4 p-6">
          <p className="text-sm font-semibold text-indigo-300">Create a new project</p>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
              Project Name
            </label>
            <input name="name" required className="input-field" placeholder="Q2 Product Launch" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
              Description
            </label>
            <textarea
              name="description"
              rows={2}
              className="input-field resize-none"
              placeholder="Brief overview of objectives and scope"
            />
          </div>
          <button type="submit" className="btn-primary">
            Create Project
          </button>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="surface-card p-12 text-center">
          <p className="text-[var(--text-muted)]">
            {isAdmin
              ? "No projects yet. Create your first project above — you will be the Admin."
              : "You are not on any projects yet. Ask a project admin to add your signup email as a member."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="surface-card surface-card-hover group block p-6"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-xl font-bold text-white group-hover:text-indigo-200 transition">
                  {p.name}
                </h2>
                <StatusBadge status={p.role} />
              </div>
              {p.description && (
                <p className="mt-2 text-sm text-[var(--text-muted)] line-clamp-2">{p.description}</p>
              )}
              <p className="mt-4 text-xs font-medium text-[var(--text-dim)]">
                {p.memberCount} members · {p.taskCount} tasks
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
