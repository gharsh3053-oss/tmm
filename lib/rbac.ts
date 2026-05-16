import { ProjectRole } from "@/lib/constants";
import { prisma } from "./prisma";

export async function getMembership(userId: string, projectId: string) {
  return prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
}

export async function requireMembership(userId: string, projectId: string) {
  const membership = await getMembership(userId, projectId);
  if (!membership) {
    throw new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return membership;
}

export async function requireAdmin(userId: string, projectId: string) {
  const membership = await requireMembership(userId, projectId);
  if (membership.role !== ProjectRole.ADMIN) {
    throw new Response(JSON.stringify({ error: "Admin access required" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return membership;
}

export function isAdmin(role: ProjectRole) {
  return role === ProjectRole.ADMIN;
}
