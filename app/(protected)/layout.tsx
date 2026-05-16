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

  const adminMembership = await prisma.projectMember.findFirst({
    where: { userId: session.userId, role: "ADMIN" },
    select: { role: true },
  });

  const userRole = adminMembership ? "ADMIN" : "MEMBER";

  return (
    <AppShell userName={session.name} userRole={userRole}>
      {children}
    </AppShell>
  );
}
