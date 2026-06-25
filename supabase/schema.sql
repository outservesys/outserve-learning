-- ============================================================
-- Outserve Learning Centre — Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Tables ──────────────────────────────────────────────────

create table if not exists public.staff (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  role        text not null default '',
  dept        text not null default 'Technology',
  email       text unique,
  avatar      text not null default '',
  color       text not null default '#00D4B8',
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.modules (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  category    text not null check (category in ('IT', 'COMPLIANCE', 'SOFT')),
  duration    integer not null default 60,   -- minutes
  description text not null default '',
  lessons     integer not null default 5,
  pass_mark   integer not null default 80,
  created_at  timestamptz not null default now()
);

create table if not exists public.plans (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  description text not null default '',
  icon        text not null default 'server',
  created_at  timestamptz not null default now()
);

create table if not exists public.plan_modules (
  id          uuid primary key default uuid_generate_v4(),
  plan_id     uuid not null references public.plans(id) on delete cascade,
  module_id   uuid not null references public.modules(id) on delete cascade,
  position    integer not null default 0,
  unique(plan_id, module_id)
);

create table if not exists public.assignments (
  id            uuid primary key default uuid_generate_v4(),
  staff_id      uuid not null references public.staff(id) on delete cascade,
  module_id     uuid not null references public.modules(id) on delete cascade,
  assigned_date date not null default current_date,
  due_date      date not null,
  status        text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  progress      integer not null default 0 check (progress >= 0 and progress <= 100),
  score         integer check (score >= 0 and score <= 100),
  created_at    timestamptz not null default now(),
  unique(staff_id, module_id)
);

-- ── Indexes ─────────────────────────────────────────────────
create index if not exists assignments_staff_id_idx  on public.assignments(staff_id);
create index if not exists assignments_module_id_idx on public.assignments(module_id);
create index if not exists assignments_status_idx    on public.assignments(status);
create index if not exists plan_modules_plan_id_idx  on public.plan_modules(plan_id);

-- ── Row Level Security ───────────────────────────────────────
-- For now: allow all authenticated users full access.
-- Tighten per-row policies once you add Supabase Auth logins.

alter table public.staff       enable row level security;
alter table public.modules     enable row level security;
alter table public.plans       enable row level security;
alter table public.plan_modules enable row level security;
alter table public.assignments  enable row level security;

-- Staff: anyone authenticated can read; admin flag gates writes (enforced in app)
create policy "staff_select"  on public.staff       for select using (true);
create policy "staff_insert"  on public.staff       for insert with check (true);
create policy "staff_update"  on public.staff       for update using (true);
create policy "staff_delete"  on public.staff       for delete using (true);

create policy "modules_select" on public.modules    for select using (true);
create policy "modules_insert" on public.modules    for insert with check (true);
create policy "modules_update" on public.modules    for update using (true);
create policy "modules_delete" on public.modules    for delete using (true);

create policy "plans_select"  on public.plans       for select using (true);
create policy "plans_insert"  on public.plans       for insert with check (true);
create policy "plans_update"  on public.plans       for update using (true);
create policy "plans_delete"  on public.plans       for delete using (true);

create policy "plan_modules_select" on public.plan_modules for select using (true);
create policy "plan_modules_insert" on public.plan_modules for insert with check (true);
create policy "plan_modules_update" on public.plan_modules for update using (true);
create policy "plan_modules_delete" on public.plan_modules for delete using (true);

create policy "assignments_select" on public.assignments for select using (true);
create policy "assignments_insert" on public.assignments for insert with check (true);
create policy "assignments_update" on public.assignments for update using (true);
create policy "assignments_delete" on public.assignments for delete using (true);

-- ── Helpful views ────────────────────────────────────────────

create or replace view public.assignment_details as
select
  a.id,
  a.staff_id,
  s.name        as staff_name,
  s.role        as staff_role,
  s.avatar      as staff_avatar,
  s.color       as staff_color,
  a.module_id,
  m.title       as module_title,
  m.category    as module_category,
  m.duration    as module_duration,
  a.assigned_date,
  a.due_date,
  a.status,
  a.progress,
  a.score,
  a.due_date < current_date and a.status <> 'completed' as is_overdue
from public.assignments a
join public.staff   s on s.id = a.staff_id
join public.modules m on m.id = a.module_id;

create or replace view public.plan_details as
select
  p.id          as plan_id,
  p.title       as plan_title,
  p.description as plan_description,
  p.icon        as plan_icon,
  pm.position,
  m.id          as module_id,
  m.title       as module_title,
  m.category    as module_category,
  m.duration    as module_duration,
  m.pass_mark   as module_pass_mark
from public.plans p
join public.plan_modules pm on pm.plan_id  = p.id
join public.modules      m  on m.id        = pm.module_id
order by p.title, pm.position;
