import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendRiskScoreNotification } from '@/lib/email';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

export async function POST(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'legal_business_name',
      'state_of_incorporation',
      'entity_type',
      'ein',
      'business_physical_address',
      'date_of_formation',
      'corporate_website_url',
      'business_phone_number',
      'email'
    ];

    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Get or create account by email
    let accountId: string | null = null;

    const { data: existingAccount } = await supabase
      .from('accounts')
      .select('account_id')
      .eq('email', body.email)
      .single();

    if (existingAccount) {
      accountId = existingAccount.account_id;
    } else {
      // Create a new account
      const { data: newAccount, error: accountError } = await supabase
        .from('accounts')
        .insert({
          email: body.email,
          password_hash: 'risk_score_submission', // Placeholder
        })
        .select('account_id')
        .single();

      if (accountError) {
        console.error('Error creating account:', accountError);
        return NextResponse.json(
          { error: 'Failed to create account', details: accountError.message },
          { status: 500 }
        );
      }

      accountId = newAccount.account_id;
    }

    // Insert risk score data into the conduct_risk_scores table
    const { data: riskScoreData, error: riskScoreError } = await supabase
      .from('conduct_risk_scores')
      .insert({
        account_id: accountId,
        // Part 1: Must-Haves (KYB/State Verification)
        legal_business_name: body.legal_business_name,
        doing_business_as: body.doing_business_as || null,
        state_of_incorporation: body.state_of_incorporation,
        entity_type: body.entity_type,
        ein: body.ein,
        business_physical_address: body.business_physical_address,
        date_of_formation: body.date_of_formation,
        // Part 2: Conduct Score (Alternative Data)
        corporate_website_url: body.corporate_website_url,
        linkedin_company_page_url: body.linkedin_company_page_url || null,
        facebook_business_page_url: body.facebook_business_page_url || null,
        yelp_google_business_profile_url: body.yelp_google_business_profile_url || null,
        business_phone_number: body.business_phone_number,
        primary_bank_account_last_4: body.primary_bank_account_last_4 || null,
      })
      .select('risk_score_id')
      .single();

    if (riskScoreError) {
      console.error('Error saving risk score data:', riskScoreError);
      const msg = String(riskScoreError.message || '');
      // Common setup issue: table does not exist yet
      const looksLikeMissingTable =
        msg.toLowerCase().includes('does not exist') ||
        msg.toLowerCase().includes('relation') ||
        (riskScoreError.code && String(riskScoreError.code) === '42P01');

      return NextResponse.json(
        {
          error: looksLikeMissingTable
            ? 'Risk score table is not set up yet. Please run database_schema_risk_scores.sql in Supabase SQL Editor.'
            : 'Failed to save risk score data',
          details: riskScoreError.message,
          hint: (riskScoreError as unknown as { hint?: string }).hint,
          code: (riskScoreError as unknown as { code?: string }).code,
        },
        { status: 500 }
      );
    }

    // Send email notification (don't wait for it to complete)
    sendRiskScoreNotification(body).then(result => {
      if (!result.success) {
        console.error('Email notification failed:', result.error);
      }
    }).catch(err => {
      console.error('Unexpected error sending email notification:', err);
      // Don't fail the request if email fails
    });

    return NextResponse.json({
      success: true,
      account_id: accountId,
      risk_score_id: riskScoreData.risk_score_id,
      message: 'Risk score information submitted successfully',
    });

  } catch (error) {
    console.error('Error in risk score submission:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

