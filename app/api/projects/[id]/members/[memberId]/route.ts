import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ProjectRole } from "@/lib/constants";
import { requireAuth, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";

type Params = { params: Promise<{ id: string; memberId: string }> };

const memberRoleSchema = z.object({
  role: z.enum([ProjectRole.ADMIN, ProjectRole.MEMBER]),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    const { id: projectId, memberId } = await params;
    await requireAdmin(session.userId, projectId);

    const body = await req.json();
    const parsed = memberRoleSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid role", 400);
    }

    const member = await prisma.projectMember.update({
      where: { id: memberId, projectId },
      data: { role: parsed.data.role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ member });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    const { id: projectId, memberId } = await params;
    await requireAdmin(session.userId, projectId);

    const member = await prisma.projectMember.findFirst({
      where: { id: memberId, projectId },
    });
    if (!member) return jsonError("Member not found", 404);

    const adminCount = await prisma.projectMember.count({
      where: { projectId, role: ProjectRole.ADMIN },
    });
    if (member.role === ProjectRole.ADMIN && adminCount <= 1) {
      return jsonError("Cannot remove the only admin", 400);
    }

    await prisma.projectMember.delete({ where: { id: memberId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return jsonError("Internal server error", 500);
  }
}
