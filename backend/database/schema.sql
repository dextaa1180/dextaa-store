create extension if not exists pgcrypto;

create type product_status as enum ('draft', 'active', 'archived');
create type order_status as enum ('pending', 'paid', 'processing', 'completed', 'cancelled', 'refunded');
create type payment_status as enum ('unpaid', 'waiting', 'paid', 'failed', 'expired', 'refunded');
create type request_status as enum ('new', 'in_review', 'resolved', 'closed');
create type review_status as enum ('pending', 'published', 'hidden');
create type user_role as enum ('customer', 'admin');
create type user_status as enum ('active', 'suspended', 'disabled');

create table users (
  id uuid primary key default gen_random_uuid(),
  name varchar(160) not null,
  email varchar(180) not null unique,
  whatsapp varchar(32) unique,
  password_hash text not null,
  role user_role not null default 'customer',
  status user_status not null default 'active',
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name varchar(120) not null unique,
  slug varchar(140) not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id),
  title varchar(180) not null,
  slug varchar(200) not null unique,
  publisher varchar(140) not null,
  short_description text,
  description text,
  badge varchar(80),
  accent_color varchar(20),
  cover_image_url text,
  cover_image_public_id text,
  status product_status not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_supports (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  label varchar(120) not null,
  sort_order integer not null default 0
);

create table product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  media_url text not null,
  alt_text varchar(180),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  server_name varchar(120),
  name varchar(220) not null,
  perk varchar(120),
  guest_price integer not null check (guest_price >= 0),
  member_price integer not null check (member_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table payment_groups (
  id uuid primary key default gen_random_uuid(),
  name varchar(120) not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table payment_methods (
  id uuid primary key default gen_random_uuid(),
  payment_group_id uuid not null references payment_groups(id),
  name varchar(120) not null,
  logo_url text,
  provider_code varchar(80),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (payment_group_id, name)
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references users(id) on delete set null,
  name varchar(160),
  whatsapp varchar(32) not null,
  email varchar(180),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (whatsapp)
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  invoice_code varchar(40) not null unique,
  customer_id uuid references customers(id),
  customer_name varchar(160),
  customer_whatsapp varchar(32) not null,
  status order_status not null default 'pending',
  payment_status payment_status not null default 'unpaid',
  subtotal integer not null check (subtotal >= 0),
  total integer not null check (total >= 0),
  promo_code varchar(80),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  product_option_id uuid references product_options(id),
  product_title varchar(180) not null,
  option_name varchar(220) not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),
  total_price integer not null check (total_price >= 0),
  game_user_id varchar(120),
  game_server varchar(120),
  created_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  payment_method_id uuid references payment_methods(id),
  amount integer not null check (amount >= 0),
  status payment_status not null default 'waiting',
  provider_reference varchar(160),
  paid_at timestamptz,
  expired_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  status order_status not null,
  title varchar(160) not null,
  message text,
  created_at timestamptz not null default now()
);

create table customer_reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete set null,
  product_id uuid references products(id) on delete set null,
  invoice_code varchar(40),
  masked_invoice varchar(40) not null,
  customer_name varchar(120),
  rating smallint not null check (rating between 1 and 5),
  message text not null,
  status review_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table contact_requests (
  id uuid primary key default gen_random_uuid(),
  form_type varchar(80) not null,
  request_type varchar(120) not null,
  name varchar(160) not null,
  whatsapp varchar(32) not null,
  message text not null,
  status request_status not null default 'new',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table banners (
  id uuid primary key default gen_random_uuid(),
  title varchar(180) not null,
  image_url text not null,
  link_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table promo_codes (
  id uuid primary key default gen_random_uuid(),
  code varchar(80) not null unique,
  description text,
  discount_amount integer not null default 0 check (discount_amount >= 0),
  discount_percent numeric(5, 2) not null default 0 check (discount_percent >= 0 and discount_percent <= 100),
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit integer check (usage_limit is null or usage_limit >= 0),
  used_count integer not null default 0 check (used_count >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger categories_set_updated_at before update on categories
for each row execute function set_updated_at();

create trigger users_set_updated_at before update on users
for each row execute function set_updated_at();

create trigger products_set_updated_at before update on products
for each row execute function set_updated_at();

create trigger product_options_set_updated_at before update on product_options
for each row execute function set_updated_at();

create trigger payment_groups_set_updated_at before update on payment_groups
for each row execute function set_updated_at();

create trigger payment_methods_set_updated_at before update on payment_methods
for each row execute function set_updated_at();

create trigger customers_set_updated_at before update on customers
for each row execute function set_updated_at();

create trigger orders_set_updated_at before update on orders
for each row execute function set_updated_at();

create trigger payments_set_updated_at before update on payments
for each row execute function set_updated_at();

create trigger customer_reviews_set_updated_at before update on customer_reviews
for each row execute function set_updated_at();

create trigger contact_requests_set_updated_at before update on contact_requests
for each row execute function set_updated_at();

create trigger banners_set_updated_at before update on banners
for each row execute function set_updated_at();

create trigger promo_codes_set_updated_at before update on promo_codes
for each row execute function set_updated_at();

create index users_role_status_idx on users (role, status);
create index categories_active_sort_idx on categories (is_active, sort_order);
create index products_category_status_sort_idx on products (category_id, status, sort_order);
create index product_options_product_active_sort_idx on product_options (product_id, is_active, sort_order);
create index orders_invoice_code_idx on orders (invoice_code);
create index orders_customer_whatsapp_idx on orders (customer_whatsapp);
create index orders_status_created_idx on orders (status, created_at desc);
create index payments_order_status_idx on payments (order_id, status);
create index customer_reviews_product_status_created_idx on customer_reviews (product_id, status, created_at desc);
create index contact_requests_status_created_idx on contact_requests (status, created_at desc);
create index banners_active_sort_idx on banners (is_active, sort_order);
