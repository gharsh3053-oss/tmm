import { NextRequest, NextResponse } from "next/server";
import { ProjectRole, TaskStatus } from "@/lib/constants";
import { requireAuth, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const projectId =
      typeof body.projectId === "string" && body.projectId.length > 0
        ? body.projectId
        : null;

    const memberships = await prisma.projectMember.findMany({
      where: { userId: session.userId },
      select: { projectId: true, role: true },
    });

    if (memberships.length === 0) {
      return NextResponse.json({ count: 0 });
    }

    let projectIds = memberships.map((m) => m.projectId);
    if (projectId) {
      if (!projectIds.includes(projectId)) {
        return jsonError("Forbidden", 403);
      }
      projectIds = [projectId];
    }

    const adminProjectIds = memberships
      .filter((m) => m.role === ProjectRole.ADMIN && projectIds.includes(m.projectId))
      .map((m) => m.projectId);

    const result = await prisma.task.updateMany({
      where: {
        projectId: { in: projectIds },
        status: { not: TaskStatus.DONE },
        OR: [
          { assigneeId: session.userId },
          ...(adminProjectIds.length > 0
            ? [{ projectId: { in: adminProjectIds } }]
            : []),
        ],
      },
      data: { status: TaskStatus.DONE },
    });

    return NextResponse.json({ count: result.count });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return jsonError("Internal server error", 500);
  }
}
