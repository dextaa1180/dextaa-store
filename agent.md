# DextaaStore Agent Notes

This repo is a full-stack game-store app with a React frontend and an Express + Prisma backend.

## What this app does

- Frontend store shows catalog, product detail, price list, reviews, tracking, and admin routes.
- Admin dashboard can manage products, price options, and transactions.
- Public catalog data is served from the database through `/api/catalog`.
- Admin-added products should flow into Postgres first, then render back on the storefront.

## Main structure

- `frontend/` - React + Vite UI
- `backend/` - Express API, Prisma, seed scripts
- `backend/prisma/schema.prisma` - active data model
- `backend/server/index.mjs` - API routes
- `backend/server/lib/catalog.mjs` - public catalog serializer
- `backend/scripts/seed-catalog.mjs` - catalog seed
- `frontend/src/App.tsx` - route switch and catalog loading
- `frontend/src/pages/AdminDashboardPage.tsx` - admin CRUD UI

## Key behavior

- Frontend fetches catalog with `GET /api/catalog`.
- Homepage and `Semua Games` use live DB data when available.
- Product images are stored as URLs, not binaries.
- Cloudinary is used for image uploads from admin.
- Deleting a product currently removes the DB row only; Cloudinary cleanup is not wired yet.

## Environment

Backend env lives in `backend/.env`.

Required values:

- `DATABASE_URL`
- `DIRECT_URL` if needed
- `API_PORT` (default `4000`)
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER` (default `dextaa-store/products`)

## Run commands

```powershell
npm run dev
npm run api -w backend
npm run build
npm run db:seed:catalog
```

## Working rules

- Keep files and folders neatly structured.
- Prefer the repo’s existing patterns over new abstractions.
- Use `apply_patch` for manual edits.
- Do not revert user changes you did not make.
- Keep edits scoped and avoid unrelated refactors.
- Prefer ASCII unless a file already uses another character set.

## Important notes

- If the backend returns a generic server error, check the terminal first.
- If Cloudinary uploads fail, verify the backend is running with the latest `.env`.
- If the frontend looks stale, restart the dev server or refresh the browser.
- The store can fall back to static mock data if the catalog API is down, but DB-backed data is the goal.
