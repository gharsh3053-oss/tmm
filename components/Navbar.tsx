"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function Navbar({ userName }: { userName: string }) {
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const nav = [
    { href: "/dashboard", label: "✨ home base" },
    { href: "/projects", label: "🚀 projects" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-xl font-black gradient-text">
            Taskly
          </Link>
          <nav className="flex gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  pathname.startsWith(item.href)
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-zinc-400 sm:inline">
            hey <span className="font-semibold text-fuchsia-300">{userName}</span> 👋
          </span>
          <button onClick={logout} className="btn-ghost text-xs sm:text-sm">
            peace out
          </button>
        </div>
      </div>
    </header>
  );
}
