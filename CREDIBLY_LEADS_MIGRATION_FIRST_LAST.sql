-- Run once if credibly_leads was created with full_name (older CREDIBLY_LEADS_TABLE.sql).
-- Do not run on a database that already has first_name and last_name and no full_name.

alter table public.credibly_leads add column if not exists first_name text;
alter table public.credibly_leads add column if not exists last_name text;

update public.credibly_leads
set
  first_name = trim(split_part(full_name, ' ', 1)),
  last_name = trim(regexp_replace(full_name, '^\S+\s*', ''))
where full_name is not null and full_name <> '';

update public.credibly_leads set first_name = coalesce(first_name, '') where first_name is null;
update public.credibly_leads set last_name = coalesce(last_name, '') where last_name is null;

alter table public.credibly_leads alter column first_name set default '';
alter table public.credibly_leads alter column last_name set default '';

alter table public.credibly_leads alter column first_name set not null;
alter table public.credibly_leads alter column last_name set not null;

alter table public.credibly_leads drop column if exists full_name;
