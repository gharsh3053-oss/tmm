import { NextResponse } from "next/server";
import { TaskStatus } from "@/lib/constants";
import { requireAuth, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const memberships = await prisma.projectMember.findMany({
      where: { userId: session.userId },
      select: { projectId: true, role: true },
    });

    const projectIds = memberships.map((m) => m.projectId);
    if (projectIds.length === 0) {
      return NextResponse.json({
        stats: {
          totalMembers: 0,
          submittedCount: 0,
          notSubmittedCount: 0,
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
        },
        projects: [],
        members: [],
        myRole: "MEMBER",
      });
    }

    const filteredProjectIds = projectId
      ? projectIds.filter((id) => id === projectId)
      : projectIds;

    if (filteredProjectIds.length === 0) {
      return NextResponse.json({
        stats: {
          totalMembers: 0,
          submittedCount: 0,
          notSubmittedCount: 0,
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
        },
        projects: [],
        members: [],
        myRole: "MEMBER",
      });
    }

    const projects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    const projectMembers = await prisma.projectMember.findMany({
      where: { projectId: { in: filteredProjectIds } },
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    const tasks = await prisma.task.findMany({
      where: { projectId: { in: filteredProjectIds } },
      include: {
        assignee: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });

    const memberMap = new Map<
      string,
      {
        id: string;
        name: string;
        email: string;
        role: string;
        projectName: string;
        totalTasks: number;
        completedTasks: number;
        inProgressTasks: number;
        activeTask: string | null;
      }
    >();

    for (const pm of projectMembers) {
      const key = `${pm.userId}-${pm.projectId}`;
      if (!memberMap.has(key)) {
        memberMap.set(key, {
          id: key,
          name: pm.user.name,
          email: pm.user.email,
          role: pm.role,
          projectName: pm.project.name,
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          activeTask: null,
        });
      }
    }

    for (const task of tasks) {
      if (!task.assigneeId) continue;
      const key = `${task.assigneeId}-${task.projectId}`;
      const member = memberMap.get(key);
      if (!member) continue;

      member.totalTasks += 1;
      if (task.status === TaskStatus.DONE) {
        member.completedTasks += 1;
      } else if (task.status === TaskStatus.IN_PROGRESS) {
        member.inProgressTasks += 1;
        if (!member.activeTask) member.activeTask = task.title;
      } else if (!member.activeTask) {
        member.activeTask = task.title;
      }
    }

    const members = Array.from(memberMap.values()).map((m) => {
      const progressPercent =
        m.totalTasks === 0
          ? 0
          : Math.round((m.completedTasks / m.totalTasks) * 100);

      let submissionStatus: "SUBMITTED" | "PENDING" | "IN_PROGRESS" = "PENDING";
      if (m.totalTasks > 0 && m.completedTasks === m.totalTasks) {
        submissionStatus = "SUBMITTED";
      } else if (m.inProgressTasks > 0 || m.completedTasks > 0) {
        submissionStatus = "IN_PROGRESS";
      }

      return {
        ...m,
        progressPercent,
        submissionStatus,
      };
    });

    const uniqueMemberIds = new Set(members.map((m) => m.id.split("-")[0]));
    const submittedCount = members.filter(
      (m) => m.submissionStatus === "SUBMITTED"
    ).length;

    const myMembership = memberships.find((m) =>
      filteredProjectIds.includes(m.projectId)
    );

    return NextResponse.json({
      stats: {
        totalMembers: uniqueMemberIds.size || members.length,
        submittedCount,
        notSubmittedCount: members.length - submittedCount,
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.status === TaskStatus.DONE).length,
        pendingTasks: tasks.filter((t) => t.status !== TaskStatus.DONE).length,
      },
      projects,
      members,
      myRole: myMembership?.role ?? "MEMBER",
    });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return jsonError("Internal server error", 500);
  }
}
