-- Pantry Vault AI: database schema (phase 1)
-- Run once in Supabase: Dashboard -> SQL Editor -> New query -> paste this file -> Run.
-- Safe to re-run: every statement checks whether the object already exists.

-- 1. PROFILES -----------------------------------------------------------------
-- One row per signed-in user, created automatically on sign-up.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  dietary_preference text not null default 'Pure Vegetarian',
  whatsapp_phone text not null default '',
  -- Billing fields for the manual UPI paywall. Users can read these but not change them.
  plan text not null default 'trial' check (plan in ('trial', 'paid', 'expired')),
  trial_ends_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Signed-in users may only edit these three columns. plan / trial_ends_at are
-- changed by you in the Supabase Table Editor after a UPI payment.
revoke update on public.profiles from authenticated;
grant update (name, dietary_preference, whatsapp_phone, updated_at) on public.profiles to authenticated;

-- Create a profile row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(split_part(new.email, '@', 1), ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. PANTRY ITEMS -------------------------------------------------------------
create table if not exists public.pantry_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  quantity numeric not null default 0 check (quantity >= 0),
  unit text not null default 'g',
  threshold numeric not null default 0 check (threshold >= 0),
  expiry_date date,
  -- Nutrition estimates, category, food group, notes. Kept flexible for now.
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pantry_items_user_idx on public.pantry_items (user_id);

alter table public.pantry_items enable row level security;

drop policy if exists "pantry: all own" on public.pantry_items;
create policy "pantry: all own" on public.pantry_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3. AI USAGE LOG -------------------------------------------------------------
-- One row per AI request. The server counts these to enforce a daily limit per user.
create table if not exists public.ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  route text not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_user_time_idx on public.ai_usage (user_id, created_at desc);

alter table public.ai_usage enable row level security;

drop policy if exists "ai_usage: read own" on public.ai_usage;
create policy "ai_usage: read own" on public.ai_usage
  for select using (auth.uid() = user_id);

drop policy if exists "ai_usage: insert own" on public.ai_usage;
create policy "ai_usage: insert own" on public.ai_usage
  for insert with check (auth.uid() = user_id);
-- No update or delete policy: users cannot erase their usage.
