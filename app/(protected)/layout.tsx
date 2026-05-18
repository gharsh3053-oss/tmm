import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppShell } from "@/components/dashboard/AppShell";
import { prisma } from "@/lib/prisma";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { systemRole: true },
  });

  const isPlatformAdmin = dbUser?.systemRole === "PLATFORM_ADMIN";

  const adminMembership = await prisma.projectMember.findFirst({
    where: { userId: session.userId, role: "ADMIN" },
    select: { role: true },
  });

  const userRole =
    isPlatformAdmin || adminMembership ? "ADMIN" : "MEMBER";

  return (
    <AppShell
      userName={session.name}
      userRole={userRole}
      isPlatformAdmin={isPlatformAdmin}
    >
      {children}
    </AppShell>
  );
}
