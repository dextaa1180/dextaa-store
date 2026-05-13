# Dextaa Store

Monorepo with separated frontend and backend workspaces:

- `frontend`: React + Vite app
- `backend`: Express + Prisma API

## Requirements

- Node.js 20+ (Node 22 recommended)
- npm 10+

## Install

From the repository root:

```bash
npm install
```

## Run in development

Start frontend + backend together:

```bash
npm run dev
```

Default local endpoints:

- Frontend: `http://localhost:5173` (or next free Vite port)
- Backend API: `http://localhost:4000`
- Health check: `http://localhost:4000/api/health`

Run services separately if needed:

```bash
npm run dev:frontend
npm run dev:backend
```

## Environment

Backend environment variables are loaded from:

- `backend/.env`

Required:

- `DATABASE_URL`

Optional:

- `API_PORT` (default: `4000`)
- `JWT_SECRET` (default fallback exists for local dev only)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` (for admin seed script)

## Database commands

From repository root:

```bash
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:validate
npm run db:check
npm run db:seed:admin
```
