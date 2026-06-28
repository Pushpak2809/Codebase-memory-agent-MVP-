create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  github_id text,
  created_at timestamptz not null default now()
);

create table if not exists repositories (
  id uuid primary key default gen_random_uuid(),
  owner text not null,
  name text not null,
  github_installation_id text,
  created_at timestamptz not null default now()
);

create table if not exists pr_reviews (
  id uuid primary key default gen_random_uuid(),
  repository_id uuid references repositories(id),
  pr_number integer,
  source text not null,
  title text,
  status text not null,
  model_used text,
  cost_usd numeric(10, 6) not null default 0,
  latency_ms integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists memory_logs (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references pr_reviews(id),
  hindsight_source text,
  title text not null,
  summary text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists cost_records (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references pr_reviews(id),
  provider text not null,
  model text not null,
  cost_usd numeric(10, 6) not null,
  created_at timestamptz not null default now()
);
