-- Remove every row from credibly_leads (Apply via Credibly captures).
-- Run in Supabase: Dashboard → SQL → New query → Run.
-- This cannot be undone; export or backup first if you need history.

truncate table public.credibly_leads;

-- Alternative (same outcome if truncate is blocked):
-- delete from public.credibly_leads;
