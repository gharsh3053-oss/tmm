import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const databaseUrlSet = Boolean(process.env.DATABASE_URL);

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      databaseUrlSet,
      nodeEnv: process.env.NODE_ENV ?? "unset",
    });
  } catch (e) {
    console.error("Health check failed:", e);
    return NextResponse.json(
      {
        ok: false,
        databaseUrlSet,
        nodeEnv: process.env.NODE_ENV ?? "unset",
        error: e instanceof Error ? e.message : "Database unavailable",
      },
      { status: 503 }
    );
  }
}
