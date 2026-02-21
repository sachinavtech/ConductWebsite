import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendRiskScoreNotification } from '@/lib/email';

// Helper to ensure email completes in serverless environment
// Actually awaits the email with a timeout to prevent function from terminating early
async function sendEmailWithTimeout(
  emailPromise: Promise<{ success: boolean; error?: string }>,
  timeoutMs: number = 5000
): Promise<{ success: boolean; error?: string }> {
  const timeoutPromise = new Promise<{ success: boolean; error?: string }>((resolve) => {
    setTimeout(() => resolve({ success: false, error: 'Email timeout' }), timeoutMs);
  });
  
  try {
    const result = await Promise.race([emailPromise, timeoutPromise]);
    if (result.success) {
      console.log('[RISK_SCORE] ✅ Email sent successfully (with timeout protection)');
    } else {
      console.error('[RISK_SCORE] Email failed or timed out:', result.error);
    }
    return result;
  } catch (err) {
    console.error('[RISK_SCORE] Unexpected error in email timeout handler:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

export async function POST(request: NextRequest): Promise<NextResponse> {
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

    // Send email notification (await with timeout to prevent function termination)
    console.log('[RISK_SCORE] Attempting to send email notification...');
    console.log('[RISK_SCORE] Body data keys:', Object.keys(body));
    console.log('[RISK_SCORE] Body data sample:', JSON.stringify(body).substring(0, 200));
    
    const emailPromise = sendRiskScoreNotification(body)
      .then(result => {
        console.log('[RISK_SCORE] Email notification result:', result);
        if (!result.success) {
          console.error('[RISK_SCORE] Email notification failed:', result.error);
        } else {
          console.log('[RISK_SCORE] ✅ Email notification sent successfully');
        }
        return result;
      })
      .catch(err => {
        console.error('[RISK_SCORE] Unexpected error sending email notification:', err);
        console.error('[RISK_SCORE] Error stack:', err instanceof Error ? err.stack : 'No stack');
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
      });
    
    // Await email with timeout (ensures function doesn't terminate before email completes)
    await sendEmailWithTimeout(emailPromise, 5000);

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

