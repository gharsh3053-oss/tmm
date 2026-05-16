import { getSession } from "./auth";
import { prisma } from "./prisma";

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw unauthorized();
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    throw unauthorized();
  }

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
  };
}

function unauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function handleAuthRouteError(e: unknown) {
  if (e instanceof Error && e.message.includes("JWT_SECRET")) {
    return Response.json(
      {
        error:
          "Authentication is not configured. Add JWT_SECRET to your .env file (use: openssl rand -base64 32).",
      },
      { status: 503 }
    );
  }
  if (e instanceof Response) return e;
  console.error(e);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
