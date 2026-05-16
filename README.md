# Team Task Manager

Full-stack team task manager with authentication, projects, role-based access (Admin/Member), tasks, and dashboard.

## Stack

- **Next.js 15** (App Router) — frontend + REST APIs
- **PostgreSQL** + **Prisma**
- **JWT** session cookies
- **Railway** deployment

## Features

- Signup / Login / Logout
- Create projects (creator becomes Admin)
- Add team members by email (Admin only)
- Create & assign tasks, update status
- Dashboard: task counts, my tasks, overdue tasks
- RBAC: Admin vs Member per project

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy env and set secrets:

```bash
cp .env.example .env
```

3. Start PostgreSQL (Docker example):

```bash
docker run --name teamtask-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=teamtask -p 5432:5432 -d postgres:16
```

Set `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/teamtask`

4. Run migrations and dev server:

```bash
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Railway deployment (required)

1. Push this repo to GitHub.
2. Create a project on [Railway](https://railway.app).
3. Add **PostgreSQL** plugin → copy `DATABASE_URL` to your app service variables.
4. Add variables:
   - `DATABASE_URL` (from Postgres service)
   - `JWT_SECRET` (long random string, e.g. `openssl rand -base64 32`)
   - `NODE_ENV=production`
5. In **Settings → Deploy**, confirm these commands:

```bash
npm run build
npm run start
```

6. Set release command:

```bash
npx prisma migrate deploy
```

7. Deploy the app service from your repo.
8. Open the generated public URL and test signup → create project → add task.

### Production note

For production, keep schema changes out of the start command. Use `npx prisma migrate deploy`
as the Railway release command, and use `npm run start` only to boot the Next.js server.

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |
| GET/POST | `/api/projects` | List / create projects |
| GET/PATCH/DELETE | `/api/projects/:id` | Project detail |
| POST | `/api/projects/:id/members` | Add member (Admin) |
| GET/POST | `/api/projects/:id/tasks` | List / create tasks |
| PATCH/DELETE | `/api/tasks/:id` | Update / delete task |
| GET | `/api/dashboard` | Dashboard stats |

## Demo flow for reviewers

1. Sign up as User A → create project "Sprint 1"
2. Sign up as User B in another browser/incognito
3. User A adds User B's email as Member
4. Create tasks, assign to User B, set due dates
5. User B updates task status on dashboard
6. Check overdue tasks on dashboard
# tmm
