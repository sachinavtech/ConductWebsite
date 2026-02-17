-- SQL Queries to Clear Data from Tables
-- Execute these in Supabase SQL Editor
-- WARNING: This will permanently delete all data from these tables!

-- Option 1: Delete in order (respecting foreign keys)
-- Delete from child tables first, then parent table

-- Clear conduct_risk_scores table
DELETE FROM conduct_risk_scores;

-- Clear answers table
DELETE FROM answers;

-- Clear accounts table (this will also work due to CASCADE if foreign keys are set up)
DELETE FROM accounts;

-- Option 2: Truncate tables (faster, resets auto-increment if any)
-- Note: Truncate may not work if there are foreign key constraints
-- Uncomment these if you want to use truncate instead

-- TRUNCATE TABLE conduct_risk_scores CASCADE;
-- TRUNCATE TABLE answers CASCADE;
-- TRUNCATE TABLE accounts CASCADE;

-- Option 3: Delete all in one transaction (safer - all or nothing)
-- Uncomment to use:

-- BEGIN;
-- DELETE FROM conduct_risk_scores;
-- DELETE FROM answers;
-- DELETE FROM accounts;
-- COMMIT;

-- Verification queries (run after deletion to confirm)
-- SELECT COUNT(*) FROM conduct_risk_scores;  -- Should return 0
-- SELECT COUNT(*) FROM answers;              -- Should return 0
-- SELECT COUNT(*) FROM accounts;             -- Should return 0

