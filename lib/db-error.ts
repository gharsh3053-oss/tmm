import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export function handleDbError(e: unknown) {
  if (e instanceof Prisma.PrismaClientInitializationError) {
    return NextResponse.json(
      {
        error:
          "Database is not available. Run: npx prisma db push   (or start PostgreSQL if using Docker)",
      },
      { status: 503 }
    );
  }
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    return NextResponse.json(
      { error: "Database error", code: e.code },
      { status: 500 }
    );
  }
  console.error(e);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
