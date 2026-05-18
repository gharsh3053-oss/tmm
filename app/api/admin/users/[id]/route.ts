import { NextRequest, NextResponse } from "next/server";
import { SystemRole } from "@/lib/constants";
import { requireAuth, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { isUserInactive, requirePlatformAdmin } from "@/lib/system-admin";
import { adminUserUpdateSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    await requirePlatformAdmin(session.userId);
    const { id } = await params;

    if (id === session.userId) {
      const body = await req.json();
      const parsed = adminUserUpdateSchema.safeParse(body);
      if (parsed.success && parsed.data.systemRole === SystemRole.USER) {
        return jsonError("You cannot remove your own platform admin role", 400);
      }
    }

    const body = await req.json();
    const parsed = adminUserUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: {
        id: true,
        name: true,
        email: true,
        systemRole: true,
        isActive: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireAuth();
    await requirePlatformAdmin(session.userId);
    const { id } = await params;

    if (id === session.userId) {
      return jsonError("You cannot delete your own account", 400);
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { isActive: true, lastActiveAt: true, createdAt: true },
    });
    if (!user) return jsonError("User not found", 404);

    if (!isUserInactive(user)) {
      return jsonError(
        "Only inactive accounts can be deleted. Deactivate the user first or wait 30 days without activity.",
        400
      );
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return jsonError("Internal server error", 500);
  }
}
