-- ============================================================================
-- CGT Unified Platform — initial schema
-- Run this in the Supabase SQL Editor (or via the CLI) on a fresh project.
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE throughout.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Profiles (one row per auth user) + role
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  role        text not null default 'analyst',  -- admin | manager | analyst | viewer
  created_at  timestamptz not null default now()
);

-- Auto-create a profile when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Write-permission helper used by RLS policies.
create or replace function public.can_write()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','manager','analyst')
  );
$$;

-- ----------------------------------------------------------------------------
-- Audit trail (append-only)
-- ----------------------------------------------------------------------------
create table if not exists public.audit_log (
  id          uuid primary key default gen_random_uuid(),
  table_name  text,
  record_id   uuid,
  action      text,
  detail      jsonb,
  source      text default 'db',
  changed_by  uuid,
  created_at  timestamptz not null default now()
);

create or replace function public.audit_capture()
returns trigger language plpgsql security definer set search_path = public as $$
declare rid uuid;
begin
  rid := coalesce((case when tg_op = 'DELETE' then old.id else new.id end), gen_random_uuid());
  insert into public.audit_log (table_name, record_id, action, detail, source, changed_by)
  values (
    tg_table_name,
    rid,
    lower(tg_op),
    case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end,
    'db',
    auth.uid()
  );
  return case when tg_op = 'DELETE' then old else new end;
end; $$;

-- Keep updated_at fresh.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

-- ----------------------------------------------------------------------------
-- Domain tables — every table shares: id, code, created_at, updated_at, created_by
-- ----------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(), code text,
  title text not null, modality text, phase text, status text, lead text, description text,
  created_at timestamptz default now(), updated_at timestamptz default now(), created_by uuid default auth.uid()
);

create table if not exists public.eln_entries (
  id uuid primary key default gen_random_uuid(), code text,
  title text not null, project_id uuid references public.projects(id) on delete set null,
  experiment_type text, author text, status text, objective text, observations text,
  created_at timestamptz default now(), updated_at timestamptz default now(), created_by uuid default auth.uid()
);

create table if not exists public.tech_transfers (
  id uuid primary key default gen_random_uuid(), code text,
  title text not null, project_id uuid references public.projects(id) on delete set null,
  from_site text, to_site text, status text, scope text, gaps text,
  created_at timestamptz default now(), updated_at timestamptz default now(), created_by uuid default auth.uid()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(), code text,
  name text not null, category text, contact_email text, qualified boolean default false, status text, notes text,
  created_at timestamptz default now(), updated_at timestamptz default now(), created_by uuid default auth.uid()
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(), code text,
  name text not null, material_type text, grade text, unit text,
  supplier_id uuid references public.suppliers(id) on delete set null, status text, storage text,
  created_at timestamptz default now(), updated_at timestamptz default now(), created_by uuid default auth.uid()
);

create table if not exists public.inventory_lots (
  id uuid primary key default gen_random_uuid(), code text,
  material_id uuid references public.materials(id) on delete set null,
  lot_number text, quantity numeric, location text, received_date date, expiry_date date, status text,
  created_at timestamptz default now(), updated_at timestamptz default now(), created_by uuid default auth.uid()
);

create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(), code text,
  supplier_id uuid references public.suppliers(id) on delete set null,
  description text, requested_by text, total_value numeric, currency text, status text, need_by_date date, notes text,
  created_at timestamptz default now(), updated_at timestamptz default now(), created_by uuid default auth.uid()
);

create table if not exists public.batches (
  id uuid primary key default gen_random_uuid(), code text,
  product text not null, project_id uuid references public.projects(id) on delete set null,
  stage text, scale text, manufacture_date date, status text, mbr_reference text, remarks text,
  created_at timestamptz default now(), updated_at timestamptz default now(), created_by uuid default auth.uid()
);

create table if not exists public.specifications (
  id uuid primary key default gen_random_uuid(), code text,
  attribute text not null, category text, method text, acceptance text, unit text, status text,
  created_at timestamptz default now(), updated_at timestamptz default now(), created_by uuid default auth.uid()
);

create table if not exists public.qc_results (
  id uuid primary key default gen_random_uuid(), code text,
  batch_id uuid references public.batches(id) on delete set null,
  spec_id uuid references public.specifications(id) on delete set null,
  attribute text, result_value text, analyst text, test_date date, status text, remarks text,
  created_at timestamptz default now(), updated_at timestamptz default now(), created_by uuid default auth.uid()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(), code text,
  title text not null, doc_type text, version text, owner text, status text,
  effective_date date, review_date date, summary text,
  created_at timestamptz default now(), updated_at timestamptz default now(), created_by uuid default auth.uid()
);

create table if not exists public.deviations (
  id uuid primary key default gen_random_uuid(), code text,
  title text not null, severity text, batch_id uuid references public.batches(id) on delete set null,
  reported_by text, occurred_date date, status text, description text, root_cause text,
  created_at timestamptz default now(), updated_at timestamptz default now(), created_by uuid default auth.uid()
);

create table if not exists public.capa (
  id uuid primary key default gen_random_uuid(), code text,
  title text not null, capa_type text, deviation_id uuid references public.deviations(id) on delete set null,
  owner text, due_date date, status text, action_plan text, effectiveness text,
  created_at timestamptz default now(), updated_at timestamptz default now(), created_by uuid default auth.uid()
);

create table if not exists public.change_controls (
  id uuid primary key default gen_random_uuid(), code text,
  title text not null, change_type text, impact text, requested_by text, status text,
  description text, risk_assessment text,
  created_at timestamptz default now(), updated_at timestamptz default now(), created_by uuid default auth.uid()
);

create table if not exists public.equipment (
  id uuid primary key default gen_random_uuid(), code text,
  name text not null, asset_tag text, manufacturer text, model text, location text,
  qualification text, status text, commission_date date,
  created_at timestamptz default now(), updated_at timestamptz default now(), created_by uuid default auth.uid()
);

create table if not exists public.urs_documents (
  id uuid primary key default gen_random_uuid(), code text,
  title text not null, equipment_id uuid references public.equipment(id) on delete set null,
  author text, status text, requirements text, acceptance text,
  created_at timestamptz default now(), updated_at timestamptz default now(), created_by uuid default auth.uid()
);

create table if not exists public.calibrations (
  id uuid primary key default gen_random_uuid(), code text,
  equipment_id uuid references public.equipment(id) on delete set null,
  due_date date, performed_date date, performed_by text, status text, certificate_ref text,
  created_at timestamptz default now(), updated_at timestamptz default now(), created_by uuid default auth.uid()
);

create table if not exists public.maintenance (
  id uuid primary key default gen_random_uuid(), code text,
  equipment_id uuid references public.equipment(id) on delete set null,
  maint_type text, due_date date, completed_date date, technician text, status text, work_done text,
  created_at timestamptz default now(), updated_at timestamptz default now(), created_by uuid default auth.uid()
);

create table if not exists public.batch_releases (
  id uuid primary key default gen_random_uuid(), code text,
  batch_id uuid references public.batches(id) on delete set null,
  qp text, qc_complete boolean default false, deviations_closed boolean default false,
  release_date date, status text, disposition_notes text,
  created_at timestamptz default now(), updated_at timestamptz default now(), created_by uuid default auth.uid()
);

create table if not exists public.training_courses (
  id uuid primary key default gen_random_uuid(), code text,
  title text not null, category text, document_id uuid references public.documents(id) on delete set null,
  status text, description text,
  created_at timestamptz default now(), updated_at timestamptz default now(), created_by uuid default auth.uid()
);

create table if not exists public.training_records (
  id uuid primary key default gen_random_uuid(), code text,
  trainee text not null, course_id uuid references public.training_courses(id) on delete set null,
  assigned_date date, completed_date date, score text, status text,
  created_at timestamptz default now(), updated_at timestamptz default now(), created_by uuid default auth.uid()
);

-- ----------------------------------------------------------------------------
-- Attach triggers + RLS to every domain table in one pass.
-- ----------------------------------------------------------------------------
do $$
declare t text;
declare domain_tables text[] := array[
  'projects','eln_entries','tech_transfers','suppliers','materials','inventory_lots',
  'purchase_orders','batches','specifications','qc_results','documents','deviations',
  'capa','change_controls','equipment','urs_documents','calibrations','maintenance',
  'batch_releases','training_courses','training_records'
];
begin
  foreach t in array domain_tables loop
    -- updated_at trigger
    execute format('drop trigger if exists trg_touch_%1$s on public.%1$s;', t);
    execute format('create trigger trg_touch_%1$s before update on public.%1$s for each row execute function public.touch_updated_at();', t);
    -- audit trigger
    execute format('drop trigger if exists trg_audit_%1$s on public.%1$s;', t);
    execute format('create trigger trg_audit_%1$s after insert or update or delete on public.%1$s for each row execute function public.audit_capture();', t);
    -- enable RLS
    execute format('alter table public.%1$s enable row level security;', t);
    -- read: any authenticated user
    execute format('drop policy if exists "read_%1$s" on public.%1$s;', t);
    execute format($p$create policy "read_%1$s" on public.%1$s for select to authenticated using (true);$p$, t);
    -- write: roles allowed by can_write()
    execute format('drop policy if exists "insert_%1$s" on public.%1$s;', t);
    execute format($p$create policy "insert_%1$s" on public.%1$s for insert to authenticated with check (public.can_write());$p$, t);
    execute format('drop policy if exists "update_%1$s" on public.%1$s;', t);
    execute format($p$create policy "update_%1$s" on public.%1$s for update to authenticated using (public.can_write());$p$, t);
    execute format('drop policy if exists "delete_%1$s" on public.%1$s;', t);
    execute format($p$create policy "delete_%1$s" on public.%1$s for delete to authenticated using (public.can_write());$p$, t);
  end loop;
end $$;

-- Profiles RLS
alter table public.profiles enable row level security;
drop policy if exists "profiles_read" on public.profiles;
create policy "profiles_read" on public.profiles for select to authenticated using (true);
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles for update to authenticated using (id = auth.uid());

-- Audit log RLS: readable + insertable by authenticated, but never updatable/deletable (append-only)
alter table public.audit_log enable row level security;
drop policy if exists "audit_read" on public.audit_log;
create policy "audit_read" on public.audit_log for select to authenticated using (true);
drop policy if exists "audit_insert" on public.audit_log;
create policy "audit_insert" on public.audit_log for insert to authenticated with check (true);
-- (no update/delete policies => those actions are denied for everyone)
