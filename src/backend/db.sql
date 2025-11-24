-- Migrations will appear here as you chat with AI

create table users (
  id bigint primary key generated always as identity,
  name text not null,
  email text unique not null,
  password text not null,
  created_at timestamptz default now()
);

create table products (
  id bigint primary key generated always as identity,
  name text not null,
  description text,
  price numeric(10, 2) not null,
  stock integer not null,
  parent_id bigint references products (id),
  created_at timestamptz default now()
);

create table reviews (
  id bigint primary key generated always as identity,
  user_id bigint references users (id),
  product_id bigint references products (id),
  rating int check (
    rating >= 1
    and rating <= 5
  ),
  comment text,
  created_at timestamptz default now()
);

create table carts (
  id bigint primary key generated always as identity,
  user_id bigint references users (id),
  created_at timestamptz default now()
);

create table cart_items (
  id bigint primary key generated always as identity,
  cart_id bigint references carts (id),
  product_id bigint references products (id),
  quantity int not null check (quantity > 0)
);

create table orders (
  id bigint primary key generated always as identity,
  user_id bigint references users (id),
  total numeric(10, 2) not null,
  created_at timestamptz default now()
);

create table order_items (
  id bigint primary key generated always as identity,
  order_id bigint references orders (id),
  product_id bigint references products (id),
  quantity int not null check (quantity > 0),
  price numeric(10, 2) not null
);

create table wishlist (
  id bigint primary key generated always as identity,
  user_id bigint references users (id),
  product_id bigint references products (id),
  created_at timestamptz default now()
);