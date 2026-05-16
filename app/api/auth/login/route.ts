import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { createToken, setSessionCookie } from "@/lib/auth";
import { handleAuthRouteError, jsonError } from "@/lib/api";
import { handleDbError } from "@/lib/db-error";
import { isAuthConfigured } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    if (!isAuthConfigured()) {
      return jsonError(
        "Authentication is not configured. Set JWT_SECRET in .env (32+ characters).",
        503
      );
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return jsonError("Invalid email or password", 401);
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const res = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
    setSessionCookie(res, token);
    return res;
  } catch (e) {
    const authErr = handleAuthRouteError(e);
    if (authErr.status !== 500) return authErr;
    return handleDbError(e);
  }
}
