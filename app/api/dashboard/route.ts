import { NextResponse } from "next/server";
import { TaskStatus } from "@/lib/constants";
import { requireAuth, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await requireAuth();
    const now = new Date();

    const projectIds = (
      await prisma.projectMember.findMany({
        where: { userId: session.userId },
        select: { projectId: true },
      })
    ).map((m) => m.projectId);

    if (projectIds.length === 0) {
      return NextResponse.json({
        stats: { total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 },
        myTasks: [],
        overdueTasks: [],
        recentProjects: [],
      });
    }

    const tasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
    });

    const stats = {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === TaskStatus.TODO).length,
      inProgress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
      done: tasks.filter((t) => t.status === TaskStatus.DONE).length,
      overdue: tasks.filter(
        (t) =>
          t.dueDate &&
          t.dueDate < now &&
          t.status !== TaskStatus.DONE
      ).length,
    };

    const myTasks = tasks
      .filter((t) => t.assigneeId === session.userId && t.status !== TaskStatus.DONE)
      .slice(0, 10);

    const overdueTasks = tasks
      .filter(
        (t) =>
          t.dueDate &&
          t.dueDate < now &&
          t.status !== TaskStatus.DONE
      )
      .sort((a, b) => (a.dueDate!.getTime() - b.dueDate!.getTime()))
      .slice(0, 10);

    const recentProjects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, name: true, updatedAt: true },
    });

    return NextResponse.json({ stats, myTasks, overdueTasks, recentProjects });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return jsonError("Internal server error", 500);
  }
}
