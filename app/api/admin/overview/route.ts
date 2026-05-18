import { NextResponse } from "next/server";
import { TaskStatus } from "@/lib/constants";
import { requireAuth, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { isUserInactive, requirePlatformAdmin } from "@/lib/system-admin";

export async function GET() {
  try {
    const session = await requireAuth();
    await requirePlatformAdmin(session.userId);

    const now = new Date();

    const [users, projects, totalTasks, tasks, usersList] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.task.count(),
      prisma.task.findMany({
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true, email: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 50,
      }),
      prisma.user.findMany({
        select: {
          id: true,
          isActive: true,
          lastActiveAt: true,
          createdAt: true,
        },
      }),
    ]);

    const inactiveUsers = usersList.filter((u) => isUserInactive(u)).length;

    const [todo, inProgress, done, overdue] = await Promise.all([
      prisma.task.count({ where: { status: TaskStatus.TODO } }),
      prisma.task.count({ where: { status: TaskStatus.IN_PROGRESS } }),
      prisma.task.count({ where: { status: TaskStatus.DONE } }),
      prisma.task.count({
        where: {
          dueDate: { lt: now },
          status: { not: TaskStatus.DONE },
        },
      }),
    ]);

    const stats = {
      users,
      inactiveUsers,
      projects,
      tasks: totalTasks,
      todo,
      inProgress,
      done,
      overdue,
    };

    const projectsWithCounts = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { members: true, tasks: true } },
        members: {
          include: { user: { select: { name: true } } },
          take: 3,
        },
      },
    });

    return NextResponse.json({
      stats,
      projects: projectsWithCounts.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        memberCount: p._count.members,
        taskCount: p._count.tasks,
        members: p.members.map((m) => m.user.name),
        updatedAt: p.updatedAt,
      })),
      recentTasks: tasks,
    });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return jsonError("Internal server error", 500);
  }
}
