import { spawnSync } from "node:child_process";

function withSsl(url) {
  if (!url) return url;
  if (url.includes("sslmode=")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}sslmode=require`;
}

const url = withSsl(process.env.DATABASE_URL);
if (!url) {
  console.error("DATABASE_URL is not set — skipping schema sync.");
  process.exit(0);
}

const result = spawnSync("npx", ["prisma", "db", "push", "--skip-generate"], {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: url },
});

process.exit(result.status ?? 1);
