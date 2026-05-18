import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SystemRole } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { systemRole: true, isActive: true },
  });

  if (!user?.isActive || user.systemRole !== SystemRole.PLATFORM_ADMIN) {
    redirect("/dashboard");
  }

  return children;
}
