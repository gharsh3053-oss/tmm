"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconDashboard,
  IconLogout,
  IconPlus,
  IconProjects,
  IconTasks,
} from "./icons";
import { useCreateTask } from "./CreateTaskContext";
import { useUserRole } from "./UserRoleContext";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const baseNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: IconDashboard },
  { href: "/projects", label: "Projects", icon: IconProjects, matchPrefix: true },
  { href: "/my-tasks", label: "My Tasks", icon: IconTasks },
] as const;

function isNavActive(pathname: string, href: string, matchPrefix?: boolean) {
  if (matchPrefix) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  return pathname === href;
}

export function Sidebar({
  userName,
  userRole,
}: {
  userName: string;
  userRole?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { openCreateTask } = useCreateTask();
  const { isAdmin, isPlatformAdmin } = useUserRole();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-[260px] flex-col border-r border-[var(--border-subtle)] bg-[var(--bg)] shadow-xl shadow-black/20">
      <div className="shrink-0 px-4 pb-4 pt-6">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent)] shadow-lg shadow-[var(--accent-glow)]">
            <span className="text-lg font-black text-white">T</span>
          </div>
          <div>
            <p className="text-lg font-bold text-white">Team Task</p>
            <p className="text-[10px] text-[var(--text-dim)]">Manager</p>
          </div>
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-4 scroll-smooth">
        <div className="space-y-1">
          {[
            ...baseNavItems,
            ...(isPlatformAdmin
              ? [{ href: "/admin", label: "Admin", icon: IconDashboard, matchPrefix: true as const }]
              : []),
          ].map((item) => {
            const active = isNavActive(
              pathname,
              item.href,
              "matchPrefix" in item && item.matchPrefix
            );
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-[var(--accent-muted)] text-[var(--accent-light)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-white"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-[var(--accent)]" : ""}`} />
                {item.label}
              </Link>
            );
          })}
          {isAdmin && (
            <button
              type="button"
              onClick={() => openCreateTask()}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface)] hover:text-white"
            >
              <IconPlus className="h-5 w-5" />
              Create Task
            </button>
          )}
        </div>
      </nav>

      <div className="shrink-0 border-t border-[var(--border-subtle)] bg-[var(--bg)] px-4 py-4">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[var(--text-dim)] transition hover:bg-[var(--surface)] hover:text-white"
        >
          <IconLogout className="h-5 w-5" />
          Logout
        </button>

        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-[var(--surface)] p-3 shadow-inner shadow-black/10">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-muted)] text-xs font-bold text-[var(--accent-light)]">
            {getInitials(userName)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{userName}</p>
            <p className="text-[10px] text-[var(--text-dim)]">
              {isPlatformAdmin
                ? "Platform admin"
                : userRole === "ADMIN"
                  ? "Project admin"
                  : "Member"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
