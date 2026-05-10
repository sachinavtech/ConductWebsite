-- Run in Supabase SQL Editor (Dashboard → SQL → New query).
-- Stores leads captured before redirecting to Credibly.
--
-- If you already ran an older version with full_name only, run
-- CREDIBLY_LEADS_MIGRATION_FIRST_LAST.sql instead / first.

create table if not exists public.credibly_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  first_name text not null,
  last_name text not null,
  business_name text not null,
  email text not null,
  phone text not null,
  monthly_revenue_range text not null,
  desired_amount text not null,
  source text not null default 'homepage_credibly_modal'
);

create index if not exists credibly_leads_created_at_idx on public.credibly_leads (created_at desc);
create index if not exists credibly_leads_email_idx on public.credibly_leads (email);

comment on table public.credibly_leads is 'Leads from Apply via Credibly flow before redirect to partner site.';
