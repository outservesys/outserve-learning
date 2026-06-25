-- ============================================================
-- Add lessons table — run in Supabase SQL Editor
-- ============================================================

create table if not exists public.lessons (
  id           uuid primary key default uuid_generate_v4(),
  module_id    uuid not null references public.modules(id) on delete cascade,
  title        text not null default 'New lesson',
  content_type text not null default 'text' check (content_type in ('text', 'video', 'quiz')),
  content      text not null default '',
  position     integer not null default 1,
  created_at   timestamptz not null default now()
);

create index if not exists lessons_module_id_idx on public.lessons(module_id);

alter table public.lessons enable row level security;
create policy "lessons_all" on public.lessons
  for all to authenticated using (true) with check (true);
