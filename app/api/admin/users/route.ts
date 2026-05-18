import { NextResponse } from "next/server";
import { requireAuth, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { isUserInactive, requirePlatformAdmin } from "@/lib/system-admin";

export async function GET() {
  try {
    const session = await requireAuth();
    await requirePlatformAdmin(session.userId);

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        systemRole: true,
        isActive: true,
        lastActiveAt: true,
        createdAt: true,
        _count: {
          select: {
            memberships: true,
            assignedTasks: true,
            createdTasks: true,
          },
        },
      },
    });

    return NextResponse.json({
      users: users.map((u) => ({
        ...u,
        inactive: isUserInactive(u),
        projectCount: u._count.memberships,
        assignedTaskCount: u._count.assignedTasks,
        createdTaskCount: u._count.createdTasks,
      })),
    });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return jsonError("Internal server error", 500);
  }
}
