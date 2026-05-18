import { SystemRole } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string) {
  return getAdminEmails().includes(email.toLowerCase());
}

export async function resolveSystemRoleForEmail(email: string) {
  if (isAdminEmail(email)) return SystemRole.PLATFORM_ADMIN;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { systemRole: true },
  });
  return user?.systemRole ?? SystemRole.USER;
}

export async function requirePlatformAdmin(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { systemRole: true, isActive: true },
  });

  if (!user?.isActive || user.systemRole !== SystemRole.PLATFORM_ADMIN) {
    throw new Response(JSON.stringify({ error: "Platform admin access required" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  return user;
}

export async function touchLastActive(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { lastActiveAt: new Date() },
  });
}

/** Inactive: deactivated by admin OR no activity for 30+ days */
export function isUserInactive(user: {
  isActive: boolean;
  lastActiveAt: Date | null;
  createdAt: Date;
}) {
  if (!user.isActive) return true;
  const reference = user.lastActiveAt ?? user.createdAt;
  const days =
    (Date.now() - reference.getTime()) / (1000 * 60 * 60 * 24);
  return days >= 30;
}
