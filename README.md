# Virtus — Team Task Manager

Full-stack team task management web app (Trello/Asana-style) with JWT authentication, projects, role-based access, tasks with priority, and an analytics dashboard.

## Live demo & submission

| Item | Link |
|------|------|
| **Live app** | _Add your Railway URL after deploy_ |
| **GitHub** | _Add your repository URL_ |
| **Demo video** | _2–5 min walkthrough (Loom/YouTube) — signup, project, members, tasks, dashboard, roles_ |

## Features (assignment checklist)

### Authentication
- Signup: name, email, password
- Login / logout with **JWT** stored in HTTP-only session cookie

### Projects
- Create projects (creator becomes **Admin**)
- Admin: add/remove members by email
- Members: view projects they belong to

### Tasks
- Title, description, due date, **priority** (Low / Medium / High)
- Assign to project members
- Status: **To Do**, **In Progress**, **Done**

### Dashboard
- Total tasks
- Tasks by status (To Do / In Progress / Done)
- Tasks per user (assignee breakdown)
- Overdue tasks list

### Role-based access
- **Admin**: manage members, create/delete tasks, edit any task
- **Member**: view project tasks; update **status only** on tasks assigned to them

## Tech stack

- **Next.js 15** (App Router) — UI + REST APIs
- **PostgreSQL** + **Prisma**
- **JWT** (jose) session cookies
- **Tailwind CSS**
- **Railway** deployment

## Local setup

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ (local or Docker)

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/teamtask"
JWT_SECRET="your-long-random-secret"
```

Generate a secret:

```bash
openssl rand -base64 32
```

### 3. Database

**Docker Postgres (optional):**

```bash
docker run --name teamtask-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=teamtask \
  -p 5432:5432 -d postgres:16
```

**Apply schema:**

```bash
npx prisma db push
```

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Railway deployment (required)

### Architecture

You need **two services** in one Railway project:

1. **PostgreSQL** — database plugin
2. **Web app** — deploy from this GitHub repo

### Step-by-step

1. Push this repo to GitHub.
2. Create a project on [Railway](https://railway.app).
3. **Add PostgreSQL** (New → Database → PostgreSQL).
4. **Add the web service** (New → GitHub Repo → select this repo).
5. On the **web service**, open **Variables** and set:
   - `DATABASE_URL` — use **Reference** → link to Postgres `DATABASE_URL`
   - `JWT_SECRET` — long random string (`openssl rand -base64 32`)
   - `NODE_ENV` = `production` (runtime only; do **not** use custom values like `prod`)
6. Deploy. The repo includes `railway.toml`:
   - **Pre-deploy**: `node scripts/railway-db-push.mjs` (syncs Prisma schema)
   - **Health check**: `GET /api/health`
7. Copy the public **web service** URL (Settings → Networking → Generate Domain).
8. Verify: visit `/api/health` — should return `{ "ok": true }`.

### Railway build troubleshooting

If build fails with `Html should not be imported outside of pages/_document`:

- Ensure `NODE_ENV` is exactly `production` or unset during build (not `development` or `prod`).
- This repo sets `NODE_ENV=production` in `nixpacks.toml` for the build phase only.
- Redeploy after fixing variables.

### Do not set on Railway (common mistakes)

- Do not point `DATABASE_URL` at `localhost` in production.
- Do not run `prisma db push` in the **start** command — use the pre-deploy script instead.

## API reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |
| GET | `/api/health` | DB health (deploy check) |
| GET/POST | `/api/projects` | List / create projects |
| GET/PATCH/DELETE | `/api/projects/:id` | Project detail |
| POST | `/api/projects/:id/members` | Add member (Admin) |
| DELETE | `/api/projects/:id/members/:memberId` | Remove member (Admin) |
| GET/POST | `/api/projects/:id/tasks` | List / create tasks |
| PATCH/DELETE | `/api/tasks/:id` | Update / delete task |
| POST | `/api/tasks/bulk-complete` | Mark open tasks done (admin/assignee) |
| GET | `/api/dashboard` | Stats: totals, status, per user, overdue |
| GET | `/api/team-progress` | Team widgets data |

## Demo script (for video / reviewers)

1. **User A**: Sign up → create project “Sprint 1” → add task with due date and **High** priority → assign to self.
2. **User B**: Sign up in incognito → share email with User A.
3. **User A**: Project → Team → add User B as **Member**.
4. **User A**: Create task assigned to User B.
5. **User B**: Dashboard / Schedule → update assigned task to **In Progress** → **Done**.
6. **User A**: Dashboard → review **Task overview** (totals, per user, overdue).
7. Show **Admin** removing a member and **Member** blocked from deleting tasks.

## Project structure

```
app/
  (auth)/login, signup
  (protected)/dashboard, projects, schedule, progress
  api/               # REST routes
components/          # UI, dashboard widgets, auth
lib/                 # auth, prisma, rbac, validations
prisma/schema.prisma
scripts/railway-db-push.mjs
railway.toml
```

## License

MIT — for educational / assignment use.
