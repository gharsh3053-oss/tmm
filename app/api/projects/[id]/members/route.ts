import { NextRequest, NextResponse } from "next/server";
import { requireAuth, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import { memberSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    const { id: projectId } = await params;
    await requireAdmin(session.userId, projectId);

    const body = await req.json();
    const parsed = memberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (!user) return jsonError("User not found. They must sign up first.", 404);

    const existing = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: user.id, projectId } },
    });
    if (existing) return jsonError("User is already a member", 409);

    const member = await prisma.projectMember.create({
      data: {
        userId: user.id,
        projectId,
        role: parsed.data.role,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return jsonError("Internal server error", 500);
  }
}
