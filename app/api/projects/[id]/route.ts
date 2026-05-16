import { NextRequest, NextResponse } from "next/server";
import { ProjectRole } from "@/lib/constants";
import { requireAuth, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireMembership, requireAdmin } from "@/lib/rbac";
import { projectSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    await requireMembership(session.userId, id);

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
            createdBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) return jsonError("Project not found", 404);

    const myRole = project.members.find((m) => m.userId === session.userId)?.role;
    const isAdmin = myRole === ProjectRole.ADMIN;

    const visibleTasks = isAdmin
      ? project.tasks
      : project.tasks.filter((t) => t.assigneeId === session.userId);

    return NextResponse.json({
      project: {
        ...project,
        tasks: visibleTasks,
        myRole,
        currentUserId: session.userId,
        canManageTasks: isAdmin,
        canManageMembers: isAdmin,
      },
    });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return jsonError("Internal server error", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    await requireAdmin(session.userId, id);

    const body = await req.json();
    const parsed = projectSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const project = await prisma.project.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ project });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    await requireAdmin(session.userId, id);

    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return jsonError("Internal server error", 500);
  }
}
