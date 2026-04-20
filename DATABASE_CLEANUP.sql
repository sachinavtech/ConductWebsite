-- ============================================================
-- Conduct Finance — Database Cleanup & MCA Application Schema
-- Run in Supabase SQL Editor
-- ============================================================
--
-- This script:
--   1. Drops the old questionnaire tables (questions, answers)
--   2. Drops the old risk score table if it exists
--   3. Creates the new mca_applications table
--
-- The 'accounts' table is kept — it stores applicant email records.
-- ============================================================

BEGIN;

-- ── 1. Drop old questionnaire tables ──────────────────────────
-- These were used by the old multi-question flow and are no longer referenced.
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS questions CASCADE;

-- ── 2. Drop old risk score table ──────────────────────────────
DROP TABLE IF EXISTS conduct_risk_scores CASCADE;

-- ── 3. Create MCA applications table ──────────────────────────
-- This stores the new streamlined application data.
CREATE TABLE IF NOT EXISTS mca_applications (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id      UUID REFERENCES accounts(account_id) ON DELETE CASCADE,
  ein             VARCHAR(9) NOT NULL,
  owner_name      TEXT NOT NULL,
  owner_ssn_last4 VARCHAR(4) NOT NULL,
  ownership_percentage TEXT NOT NULL,
  phone           VARCHAR(10) NOT NULL,
  advance_amount  TEXT NOT NULL,
  bank_data_method TEXT NOT NULL DEFAULT 'upload',  -- 'plaid' or 'upload'
  bank_statements_meta JSONB NOT NULL DEFAULT '[]'::jsonb,
  consent_given   BOOLEAN NOT NULL DEFAULT false,
  consent_timestamp TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'submitted',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Index for lookups by account
CREATE INDEX IF NOT EXISTS idx_mca_applications_account_id ON mca_applications(account_id);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_mca_applications_status ON mca_applications(status);

COMMIT;

-- ── Verification ──────────────────────────────────────────────
-- Run these after to confirm:
--
-- Tables that should NOT exist:
--   SELECT to_regclass('public.questions');       -- Should return NULL
--   SELECT to_regclass('public.answers');         -- Should return NULL
--   SELECT to_regclass('public.conduct_risk_scores'); -- Should return NULL
--
-- Tables that SHOULD exist:
--   SELECT to_regclass('public.accounts');        -- Should return 'accounts'
--   SELECT to_regclass('public.mca_applications');-- Should return 'mca_applications'
--
-- Check new table structure:
--   SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'mca_applications' ORDER BY ordinal_position;
