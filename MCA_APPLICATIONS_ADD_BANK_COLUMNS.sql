-- Run in Supabase: SQL → New query → Run (once per project).
-- Fixes: "Could not find the 'bank_data_method' column of 'mca_applications' in the schema cache"
-- when your table was created without the bank fields used by /api/questionnaire/submit.

alter table public.mca_applications
  add column if not exists bank_data_method text not null default 'none';

alter table public.mca_applications
  add column if not exists bank_statements_meta jsonb not null default '[]'::jsonb;

comment on column public.mca_applications.bank_data_method is 'none | plaid | upload';
