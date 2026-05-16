"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  IconDashboard,
  IconLogout,
  IconPlus,
  IconProjects,
  IconTasks,
  IconTeam,
} from "./icons";
import { useCreateTask } from "./CreateTaskContext";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const navItems = [
  { href: "/dashboard", label: "Home", icon: IconDashboard },
  { href: "/schedule", label: "Schedule", icon: IconTasks },
  { href: "/progress", label: "Progress", icon: IconTeam },
  { href: "/projects", label: "Projects", icon: IconProjects, matchPrefix: true },
] as const;

function isNavActive(
  pathname: string,
  href: string,
  matchPrefix?: boolean
) {
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
  const [search, setSearch] = useState("");

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const filteredNav = navItems.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-[260px] flex-col border-r border-[var(--border-subtle)] bg-[var(--bg)] shadow-xl shadow-black/20">
      <div className="shrink-0 px-4 pb-4 pt-6">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent)] shadow-lg shadow-[var(--accent-glow)]">
            <span className="text-lg font-black text-white">V</span>
          </div>
          <div>
            <p className="text-lg font-bold text-white">Virtus</p>
            <p className="text-[10px] text-[var(--text-dim)]">Task Track</p>
          </div>
        </div>

        <div className="relative mt-6">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="input-field !mt-0 w-full rounded-2xl py-2.5 pl-4 pr-10 text-sm"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]">⌕</span>
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-4 scroll-smooth">
        <div className="space-y-1">
          {(search ? filteredNav : navItems).map((item) => {
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
          <button
            type="button"
            onClick={() => openCreateTask()}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface)] hover:text-white"
          >
            <IconPlus className="h-5 w-5" />
            Create Task
          </button>
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
              {userRole === "ADMIN" ? "Project Lead" : "Member"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
