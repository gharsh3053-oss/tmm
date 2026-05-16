"use client";

import Link from "next/link";
import { InteractiveBackground } from "./InteractiveBackground";

const features = [
  "Signup & JWT login (name, email, password)",
  "Projects with Admin / Member roles",
  "Tasks: title, description, due date, priority",
  "Assign tasks · status: To Do, In Progress, Done",
  "Dashboard: totals, by status, per user, overdue",
];

export function PublicHero() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#121212] px-4 py-12">
      <InteractiveBackground />
      <div className="relative z-10 w-full max-w-2xl text-center">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--accent-light)]">
          Team Task Manager
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
          Manage projects, tasks, and teams in one place
        </h1>
        <p className="mt-4 text-lg text-[var(--text-muted)]">
          Full-stack app with authentication, role-based access, and a live dashboard.
        </p>

        <ul className="mx-auto mt-8 max-w-md space-y-2 text-left text-sm text-[var(--text-muted)]">
          {features.map((f) => (
            <li key={f} className="flex gap-2">
              <span className="text-[var(--accent)]">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/signup" className="btn-primary">
            Sign Up
          </Link>
          <Link href="/login" className="btn-ghost">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
