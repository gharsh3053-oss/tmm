import { getSession } from "./auth";

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return session;
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function parseBody<T>(schema: { safeParse: (d: unknown) => { success: boolean; data?: T; error?: { flatten: () => unknown } } }, body: unknown) {
  const result = schema.safeParse(body);
  if (!result.success) {
    return { error: Response.json({ error: "Validation failed", details: result.error?.flatten() }, { status: 400 }) };
  }
  return { data: result.data as T };
}
