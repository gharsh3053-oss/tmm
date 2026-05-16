import { NextRequest, NextResponse } from "next/server";
import { ProjectRole } from "@/lib/constants";
import { requireAuth, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await requireAuth();
    const projects = await prisma.project.findMany({
      where: {
        members: { some: { userId: session.userId } },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        _count: { select: { tasks: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const enriched = projects.map((p) => {
      const myMembership = p.members.find((m) => m.userId === session.userId);
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        role: myMembership?.role,
        memberCount: p.members.length,
        taskCount: p._count.tasks,
      };
    });

    return NextResponse.json({ projects: enriched });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return jsonError("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const parsed = projectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        members: {
          create: {
            userId: session.userId,
            role: ProjectRole.ADMIN,
          },
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return jsonError("Internal server error", 500);
  }
}
