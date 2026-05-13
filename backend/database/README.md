# DextaaStore Postgres Data Model

This folder contains the first database draft for the store. The SQL file is the readable Postgres reference, while `../prisma/schema.prisma` is the active Prisma model for TypeScript/backend work.

## Page Mapping

| Frontend area | Main tables |
| --- | --- |
| Homepage catalog | `categories`, `products`, `product_media`, `product_supports`, `banners` |
| Product detail page | `products`, `product_options`, `payment_groups`, `payment_methods`, `promo_codes` |
| Daftar Harga | `products`, `product_options` |
| Lacak Pesanan | `orders`, `order_items`, `payments`, `order_status_events` |
| Reviews Pelanggan | `customer_reviews`, `products`, `orders` |
| Hubungi Kami | `contact_requests` |
| Admin dashboard later | all catalog, order, payment, review, request, banner, and promo tables |
| Customer login/register | `users`, `customers` |
| Admin login | `users` with role `ADMIN` |

## Model Notes

- Prices are stored as integers in rupiah, not decimals.
- Buyers can place orders without logging in. `customers` is optional on `orders`, while `customer_whatsapp` is kept directly on the order for tracking.
- `invoice_code` is unique and should be the public lookup key for the Lacak Pesanan page.
- Reviews are moderated with `review_status` before appearing publicly.
- Contact form submissions are stored in `contact_requests` and can later become support tickets.
- Product options carry both `guest_price` and `member_price`, so Daftar Harga can be generated from the same data as checkout.
- Product cover images should store both the public URL and Cloudinary `public_id` so deletes can clean up the asset automatically.
- Product images should be uploaded to Cloudinary and stored in `products.cover_image_url` or `product_media.media_url`; keep only the URL/key in Postgres, not the image binary.
- `banners` exists so the homepage Swiper carousel can later be managed from admin.
- `users` stores both customer and admin accounts. Authorization should come from the `role` field.
- Passwords must be stored as hashes in `password_hash`; never store plain text passwords.

## Prisma Commands

Create a local `.env` from `.env.example`, then point `DATABASE_URL` to your Postgres database. If your provider gives a separate direct connection string, set `DIRECT_URL` too. Prisma CLI commands use `DIRECT_URL` when it exists and fall back to `DATABASE_URL` otherwise.

```bash
npm run db:validate
npm run db:generate
npm run db:push
npm run db:check
npm run db:studio
```

Use `npm run db:migrate` instead of `db:push` once the schema is stable enough to keep migration history.

## Docker Postgres

The local Docker setup runs:

- Postgres on `localhost:5432`
- Adminer on `http://localhost:8080`
- A persistent Docker volume named `dextaa_postgres_data`

Start the database:

```bash
npm run docker:db:up
```

Create the Prisma tables:

```bash
npm run db:push
```

Open Prisma Studio:

```bash
npm run db:studio
```

Create or update a local admin account:

```bash
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="change-this-password"
$env:ADMIN_NAME="Store Admin"
npm run db:seed:admin
```

Seed the storefront catalog into the database:

```bash
npm run db:seed:catalog
```

Adminer login values:

```text
System: PostgreSQL
Server: postgres
Username: postgres
Password: postgres
Database: dextaa_store
```

Stop containers while keeping data:

```bash
npm run docker:db:down
```

Reset local database data:

```bash
npm run docker:db:reset
```
