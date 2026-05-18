"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { CreateTaskProvider, useCreateTask } from "./CreateTaskContext";
import { DashboardHeader } from "./DashboardHeader";
import { Sidebar } from "./Sidebar";
import { UserRoleProvider } from "./UserRoleContext";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/my-tasks": "My Tasks",
  "/projects": "Projects",
  "/admin": "Platform admin",
  "/admin/users": "Manage users",
};

function getTitle(pathname: string) {
  if (pathname.match(/^\/projects\/[^/]+$/)) return "Project Details";
  return titles[pathname] ?? "Task Track";
}

function CreateTaskQueryListener() {
  const searchParams = useSearchParams();
  const { openCreateTask } = useCreateTask();

  useEffect(() => {
    if (searchParams.get("createTask") === "1") {
      openCreateTask();
    }
  }, [searchParams, openCreateTask]);

  return null;
}

function ShellInner({
  userName,
  userRole,
  children,
}: {
  userName: string;
  userRole?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <div className="virtus-bg min-h-screen">
      <Suspense fallback={null}>
        <CreateTaskQueryListener />
      </Suspense>
      <Sidebar userName={userName} userRole={userRole} />
      <div className="ml-[260px] flex min-h-screen min-w-0 flex-1 flex-col">
        <DashboardHeader title={title} userName={userName} />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}

export function AppShell({
  userName,
  userRole,
  isPlatformAdmin,
  children,
}: {
  userName: string;
  userRole?: string;
  isPlatformAdmin?: boolean;
  children: React.ReactNode;
}) {
  return (
    <UserRoleProvider userRole={userRole} isPlatformAdmin={isPlatformAdmin}>
      <CreateTaskProvider>
        <ShellInner userName={userName} userRole={userRole}>
          {children}
        </ShellInner>
      </CreateTaskProvider>
    </UserRoleProvider>
  );
}
