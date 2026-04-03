-- ═══════════════════════════════════════════════════════════════════
-- Al Wajer Pharma ERP v2 — Supabase Schema
-- Run this in Supabase → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════════

-- ── Batches (Manufacturing) ──────────────────────────────────────
create table if not exists batches (
  id text primary key,
  product text not null,
  quantity numeric not null default 0,
  actual_yield numeric not null default 0,
  expected_yield numeric not null default 0,
  status text not null default 'Scheduled',
  timestamp text not null,
  dispatch_date text,
  created_at timestamptz default now()
);

-- ── Inventory ────────────────────────────────────────────────────
create table if not exists inventory (
  id text primary key,
  s_no text not null default '',
  name text not null,
  category text not null default 'Other',
  required_for_orders numeric not null default 0,
  stock numeric not null default 0,
  balance_to_purchase numeric not null default 0,
  unit text not null default 'kg',
  stock_date text,
  safety_stock numeric,
  created_at timestamptz default now()
);

-- ── Orders (Sales) ───────────────────────────────────────────────
create table if not exists orders (
  id text primary key,
  s_no text not null default '',
  date text not null,
  invoice_no text not null default '',
  customer text not null,
  lc_no text not null default '',
  country text not null default '',
  product text not null,
  quantity numeric not null default 0,
  rate_usd numeric not null default 0,
  amount_usd numeric not null default 0,
  amount_omr numeric not null default 0,
  status text not null default 'Pending',
  material_dispatched text,
  payment_terms text,
  received_amount_omr numeric,
  pending_amount_omr numeric,
  remarks text,
  payment_method text,
  shipping_method text,
  created_at timestamptz default now()
);

-- ── Expenses (Accounting) ────────────────────────────────────────
create table if not exists expenses (
  id text primary key,
  description text not null,
  category text not null default 'Utilities',
  amount numeric not null default 0,
  status text not null default 'Pending',
  due_date text not null,
  created_at timestamptz default now()
);

-- ── Employees (HR) ───────────────────────────────────────────────
create table if not exists employees (
  id text primary key,
  name text not null,
  role text not null default '',
  department text not null default 'Admin',
  salary numeric not null default 0,
  status text not null default 'Active',
  join_date text not null,
  created_at timestamptz default now()
);

-- ── Vendors (Procurement) ────────────────────────────────────────
create table if not exists vendors (
  id text primary key,
  name text not null,
  category text not null default 'API',
  rating numeric not null default 0,
  status text not null default 'Audit Pending',
  country text not null default '',
  created_at timestamptz default now()
);

-- ── BD Leads (Business Dev) ──────────────────────────────────────
create table if not exists bd_leads (
  id text primary key,
  target_market text not null,
  opportunity text not null,
  potential_value text not null default '',
  status text not null default 'Prospecting',
  probability numeric not null default 0,
  created_at timestamptz default now()
);

-- ── Samples ──────────────────────────────────────────────────────
create table if not exists samples (
  id text primary key,
  product text not null,
  destination text not null,
  quantity text not null default '0',
  status text not null default 'Requested',
  tracking_number text,
  created_at timestamptz default now()
);

-- ── Markets ──────────────────────────────────────────────────────
create table if not exists markets (
  id text primary key,
  name text not null,
  region text not null,
  status text not null default 'Active',
  created_at timestamptz default now()
);

-- ── R&D Projects ─────────────────────────────────────────────────
create table if not exists rd_projects (
  id text primary key,
  title text not null,
  product_code text,
  dosage_form text,
  strength text,
  therapeutic_category text,
  shelf_life text,
  storage_condition text,
  manufacturing_process text,
  quality_standards text,
  regulatory_status text,
  status text not null default 'Formulation',
  ingredients jsonb not null default '[]',
  packing_materials jsonb,
  optimization_score numeric not null default 0,
  ai_optimization_notes text,
  last_updated text not null,
  batch_size numeric not null default 0,
  batch_unit text not null default 'kg',
  total_rmc numeric not null default 0,
  loss numeric not null default 0,
  total_final_rmc numeric not null default 0,
  versions jsonb,
  created_at timestamptz default now()
);

-- ── Audit Logs ───────────────────────────────────────────────────
create table if not exists audit_logs (
  id text primary key,
  action text not null,
  "user" text not null default 'Current User',
  details text not null,
  timestamp text not null,
  created_at timestamptz default now()
);

-- ── Row Level Security (allow all for anon key — single-tenant) ──
alter table batches enable row level security;
alter table inventory enable row level security;
alter table orders enable row level security;
alter table expenses enable row level security;
alter table employees enable row level security;
alter table vendors enable row level security;
alter table bd_leads enable row level security;
alter table samples enable row level security;
alter table markets enable row level security;
alter table rd_projects enable row level security;
alter table audit_logs enable row level security;

-- Allow full access for authenticated and anon users (single-tenant ERP)
do $$
declare
  tbl text;
begin
  for tbl in values 'batches','inventory','orders','expenses','employees',
    'vendors','bd_leads','samples','markets','rd_projects','audit_logs'
  loop
    execute format('create policy if not exists "%s_all" on %I for all using (true) with check (true)', tbl, tbl);
  end loop;
end$$;
