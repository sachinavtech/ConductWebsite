-- Create table for Conduct Risk Score data
-- This table stores information collected for the proprietary Conduct Risk Score calculation

-- Ensure UUID generation is available (needed for gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS conduct_risk_scores (
  risk_score_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
  
  -- Part 1: Must-Haves (For Automated KYB / State Verification)
  -- These fields are required to hit Secretary of State (SOS) APIs
  legal_business_name TEXT NOT NULL,
  doing_business_as TEXT,
  state_of_incorporation VARCHAR(2) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  ein VARCHAR(10) NOT NULL,
  business_physical_address TEXT NOT NULL,
  date_of_formation DATE NOT NULL,
  
  -- Part 2: Conduct Score (Alternative Data Collection)
  -- Digital Presence fields
  corporate_website_url TEXT NOT NULL,
  linkedin_company_page_url TEXT,
  facebook_business_page_url TEXT,
  yelp_google_business_profile_url TEXT,
  
  -- Operational Consistency fields
  business_phone_number VARCHAR(20) NOT NULL,
  primary_bank_account_last_4 VARCHAR(4),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on account_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_conduct_risk_scores_account_id ON conduct_risk_scores(account_id);

-- Create index on email lookup (via accounts table join)
-- This will help with finding risk scores by email

-- Add comment to table
COMMENT ON TABLE conduct_risk_scores IS 'Stores business information for Conduct Risk Score calculation. Part 1 contains KYB/State verification data. Part 2 contains alternative data for proprietary risk scoring.';

-- Add comments to key fields
COMMENT ON COLUMN conduct_risk_scores.legal_business_name IS 'Exact spelling as on Articles of Incorporation - required for 100% match rate with SOS APIs';
COMMENT ON COLUMN conduct_risk_scores.ein IS 'Federal Tax ID - the "Social Security Number" of the business - crucial for KYB verification';
COMMENT ON COLUMN conduct_risk_scores.business_physical_address IS 'Cannot be a P.O. Box - APIs verify this against the state file';
COMMENT ON COLUMN conduct_risk_scores.corporate_website_url IS 'Used for domain age verification and email match risk signals';
COMMENT ON COLUMN conduct_risk_scores.linkedin_company_page_url IS 'Used to verify employee count and company legitimacy';
COMMENT ON COLUMN conduct_risk_scores.business_phone_number IS 'Used for VoIP check - landline/Verizon mobile vs Google Voice/burner number';
COMMENT ON COLUMN conduct_risk_scores.primary_bank_account_last_4 IS 'Last 4 digits only - used to verify commercial vs personal account usage';

