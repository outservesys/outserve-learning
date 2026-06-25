-- ============================================================
-- Add categories table — run in Supabase SQL Editor
-- ============================================================

create table if not exists public.categories (
  id         uuid primary key default uuid_generate_v4(),
  key        text not null unique,           -- e.g. 'IT', 'COMPLIANCE'
  label      text not null,                  -- e.g. 'IT & Technical'
  color      text not null default '#00D4B8',
  position   integer not null default 0,     -- display order
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;
create policy "categories_all" on public.categories for all to authenticated using (true) with check (true);

-- Also update modules table: category column now references category key (text, no FK needed for flexibility)
-- No schema change needed — modules.category already stores text

-- Seed the three default categories
insert into public.categories (key, label, color, position) values
  ('IT',         'IT & Technical',        '#00D4B8', 0),
  ('COMPLIANCE', 'Compliance',            '#FFB432', 1),
  ('SOFT',       'Customer & Soft skills','#9090FF', 2)
on conflict (key) do nothing;
