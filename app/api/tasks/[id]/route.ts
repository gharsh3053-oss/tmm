import { NextRequest, NextResponse } from "next/server";
import { ProjectRole } from "@/lib/constants";
import { requireAuth, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getMembership } from "@/lib/rbac";
import { taskUpdateSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return jsonError("Task not found", 404);

    const membership = await getMembership(session.userId, task.projectId);
    if (!membership) return jsonError("Forbidden", 403);

    const body = await req.json();
    const parsed = taskUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const isAssignee = task.assigneeId === session.userId;
    const isAdmin = membership.role === ProjectRole.ADMIN;

    if (!isAdmin && !isAssignee) {
      if (parsed.data.status && task.assigneeId === session.userId) {
        // allow status-only for assignee - handled below
      } else if (!isAssignee) {
        return jsonError("Only admin or assignee can update this task", 403);
      }
    }

    if (!isAdmin) {
      const restricted = { title: parsed.data.title, description: parsed.data.description, assigneeId: parsed.data.assigneeId, dueDate: parsed.data.dueDate };
      if (Object.values(restricted).some((v) => v !== undefined)) {
        return jsonError("Members can only update status on assigned tasks", 403);
      }
      if (!isAssignee) return jsonError("Forbidden", 403);
    }

    if (parsed.data.assigneeId) {
      const assigneeMember = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: { userId: parsed.data.assigneeId, projectId: task.projectId },
        },
      });
      if (!assigneeMember) return jsonError("Assignee must be a project member", 400);
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(parsed.data.title !== undefined && { title: parsed.data.title }),
        ...(parsed.data.description !== undefined && { description: parsed.data.description }),
        ...(parsed.data.status !== undefined && { status: parsed.data.status }),
        ...(parsed.data.dueDate !== undefined && {
          dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        }),
        ...(parsed.data.assigneeId !== undefined && { assigneeId: parsed.data.assigneeId }),
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ task: updated });
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

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return jsonError("Task not found", 404);

    const membership = await getMembership(session.userId, task.projectId);
    if (!membership || membership.role !== ProjectRole.ADMIN) {
      return jsonError("Admin access required", 403);
    }

    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return jsonError("Internal server error", 500);
  }
}
