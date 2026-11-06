create extension if not exists pgcrypto;

create table if not exists profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 name text,
 daily_goal integer default 30,
 created_at timestamptz default now()
);

create table if not exists products (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 name text not null,
 brand text,
 model text,
 shopee_url text,
 price numeric(10,2),
 commission numeric(10,2),
 category text,
 benefits text,
 champion boolean default false,
 created_at timestamptz default now()
);

create table if not exists videos (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 product_id uuid references products(id) on delete cascade,
 title text not null,
 prompt text,
 caption text,
 hashtags text,
 status text default 'draft',
 created_at timestamptz default now()
);

create table if not exists posting_queue (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 video_id uuid references videos(id) on delete cascade,
 scheduled_at timestamptz,
 status text default 'queued',
 published_at timestamptz
);

create table if not exists results (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 video_id uuid references videos(id) on delete cascade,
 views integer default 0,
 likes integer default 0,
 sales integer default 0,
 commission_earned numeric(10,2) default 0,
 created_at timestamptz default now()
);
