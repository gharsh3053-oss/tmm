export type ProjectMemberOption = {
  id: string;
  role: string;
  user: { id: string; name: string; email: string };
};

export function parseProjectMembers(raw: unknown): ProjectMemberOption[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const result: ProjectMemberOption[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const m = item as ProjectMemberOption;
    if (!m.user?.id || !m.user?.name) continue;
    if (seen.has(m.user.id)) continue;
    seen.add(m.user.id);
    result.push({
      id: typeof m.id === "string" ? m.id : m.user.id,
      role: m.role ?? "MEMBER",
      user: {
        id: m.user.id,
        name: m.user.name,
        email: m.user.email ?? "",
      },
    });
  }

  return result;
}

export function memberLabel(m: ProjectMemberOption) {
  return m.user.email ? `${m.user.name} (${m.user.email})` : m.user.name;
}
