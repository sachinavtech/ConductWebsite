# Conduct Risk Score Setup Guide

## Overview

The Conduct Risk Score feature collects business information to generate a proprietary risk score. The data is collected in two parts:

1. **Part 1: Must-Haves (KYB/State Verification)** - Required fields for automated KYB and state verification via SOS APIs
2. **Part 2: Conduct Score (Alternative Data)** - Digital presence and operational consistency data for proprietary risk scoring

## Database Setup

### 1. Create the Database Table

Run the SQL script in your Supabase SQL Editor:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `database_schema_risk_scores.sql`
4. Click **Run** to execute the script

This will create the `conduct_risk_scores` table with all necessary fields.

### 2. Verify Table Creation

After running the script, verify the table was created:

1. Go to **Table Editor** in Supabase
2. You should see the `conduct_risk_scores` table
3. Check that all columns are present:
   - `risk_score_id` (UUID, Primary Key)
   - `account_id` (UUID, Foreign Key to accounts)
   - Part 1 fields (legal_business_name, doing_business_as, state_of_incorporation, etc.)
   - Part 2 fields (corporate_website_url, linkedin_company_page_url, etc.)
   - Metadata fields (created_at, updated_at)

## Features

### Homepage Button

A new button "Check Your Conduct Risk Score" has been added to the homepage next to "Get Matched" and "Talk to the team".

### Risk Score Questionnaire

The questionnaire is accessible at `/risk-score` and includes:

**Step 1: Business Information (Must-Haves)**
- Legal Business Name (required)
- Doing Business As (DBA) - optional
- State of Incorporation (required)
- Entity Type (required)
- EIN (Federal Tax ID) (required)
- Business Physical Address (required, cannot be P.O. Box)
- Date of Formation (required)

**Step 2: Digital Presence & Operations**
- Corporate Website URL (required)
- LinkedIn Company Page URL (optional)
- Facebook Business Page URL (optional)
- Yelp / Google Business Profile URL (optional)
- Business Phone Number (required)
- Primary Bank Account (Last 4 digits only) (optional)
- Email Address (required)

### API Endpoint

The API endpoint `/api/risk-score/submit` handles:
- Validating required fields
- Creating or finding the account by email
- Storing all risk score data in the `conduct_risk_scores` table
- Returning success/error responses

## Data Collection Purpose

### Part 1: Must-Haves
These fields are essential for:
- Hitting Secretary of State (SOS) APIs (Middesk, Trulioo, Markaaz)
- Achieving 100% match rate with state records
- Automated KYB verification

### Part 2: Conduct Score
These fields are used for proprietary risk signals:

**Digital Presence:**
- **Domain Age**: Corporate website URL helps verify if domain was registered recently (fraud signal)
- **Email Match**: Verifies if email matches domain (john@besttrucking.com vs john.trucking55@gmail.com)
- **Employee Count**: LinkedIn page helps verify claimed revenue vs actual employees
- **Business Activity**: Facebook/Yelp activity indicates if business is truly active

**Operational Consistency:**
- **VoIP Check**: Business phone number helps identify landline/Verizon mobile vs Google Voice/burner numbers
- **Account Type**: Bank account last 4 digits helps verify commercial vs personal account usage

## Testing

1. Navigate to the homepage
2. Click "Check Your Conduct Risk Score"
3. Fill out Step 1 (Business Information)
4. Click "Next" to proceed to Step 2
5. Fill out Step 2 (Digital Presence & Operations)
6. Click "Submit"
7. Verify data is saved in Supabase `conduct_risk_scores` table

## Next Steps

After collecting the data, you can:
1. Integrate with SOS APIs (Middesk, Trulioo, Markaaz) using Part 1 data
2. Build proprietary risk scoring algorithms using Part 2 data
3. Calculate and store the Conduct Risk Score
4. Return the score to users via email or dashboard

## Notes

- All data is stored securely in Supabase
- The `account_id` links risk scores to user accounts
- Optional fields allow for partial data collection
- The table includes timestamps for tracking when data was collected

