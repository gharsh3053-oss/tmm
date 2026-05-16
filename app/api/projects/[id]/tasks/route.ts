import { NextRequest, NextResponse } from "next/server";
import { TaskStatus } from "@/lib/constants";
import { requireAuth, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireMembership } from "@/lib/rbac";
import { taskSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    const { id: projectId } = await params;
    await requireMembership(session.userId, projectId);

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tasks });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return jsonError("Internal server error", 500);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    const { id: projectId } = await params;
    await requireMembership(session.userId, projectId);

    const body = await req.json();
    const parsed = taskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (parsed.data.assigneeId) {
      const assigneeMember = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: { userId: parsed.data.assigneeId, projectId },
        },
      });
      if (!assigneeMember) {
        return jsonError("Assignee must be a project member", 400);
      }
    }

    const task = await prisma.task.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        status: parsed.data.status ?? TaskStatus.TODO,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        assigneeId: parsed.data.assigneeId ?? null,
        projectId,
        createdById: session.userId,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return jsonError("Internal server error", 500);
  }
}
