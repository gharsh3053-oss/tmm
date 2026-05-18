import { NextResponse } from "next/server";
import { SystemRole } from "@/lib/constants";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      systemRole: true,
      isActive: true,
      lastActiveAt: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const projectAdmin = await prisma.projectMember.findFirst({
    where: { userId: session.userId, role: "ADMIN" },
    select: { id: true },
  });

  return NextResponse.json({
    user: {
      ...user,
      isPlatformAdmin: user.systemRole === SystemRole.PLATFORM_ADMIN,
      isProjectAdmin: Boolean(projectAdmin),
    },
  });
}
