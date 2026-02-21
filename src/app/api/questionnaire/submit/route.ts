import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendQuestionnaireNotification } from '@/lib/email';
import { matchPartner } from '@/lib/partnerMatching';

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
      console.log('[QUESTIONNAIRE] ✅ Email sent successfully (with timeout protection)');
    } else {
      console.error('[QUESTIONNAIRE] Email failed or timed out:', result.error);
    }
    return result;
  } catch (err) {
    console.error('[QUESTIONNAIRE] Unexpected error in email timeout handler:', err);
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
    const { answers, email } = body;

    if (!answers || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: answers and email' },
        { status: 400 }
      );
    }

    // Create a session/account for this submission
    // For now, we'll create a simple submission record
    // You can modify this to match your database schema
    
    // Option 1: Store in a simple submissions table (if you create one)
    // Option 2: Create an account first, then store answers
    
    // For simplicity, let's create a submissions table entry
    // First, let's try to get or create an account by email
    let accountId: string | null = null;

    // Check if account exists
    const { data: existingAccount } = await supabase
      .from('accounts')
      .select('account_id')
      .eq('email', email)
      .single();

    if (existingAccount) {
      accountId = existingAccount.account_id;
    } else {
      // Create a new account (without password for questionnaire-only submissions)
      // Note: You may want to modify the accounts table to allow NULL password_hash
      const { data: newAccount, error: accountError } = await supabase
        .from('accounts')
        .insert({
          email: email,
          password_hash: 'questionnaire_submission', // Placeholder, you may want to handle this differently
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

    // Get all questions to map field names to question IDs
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('question_id, field_name');

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return NextResponse.json(
        { error: 'Failed to fetch questions', details: questionsError.message },
        { status: 500 }
      );
    }

    // Create a mapping of field_name to question_id
    const questionMap = new Map(
      questions?.map(q => [q.field_name, q.question_id]) || []
    );

    // Prepare answers for insertion
    const answerRecords = Object.entries(answers).map(([fieldName, value]) => {
      const questionId = questionMap.get(fieldName);
      if (!questionId) {
        console.warn(`Question not found for field: ${fieldName}`);
        return null;
      }

      // Handle checkbox arrays
      const answerValue = Array.isArray(value) ? JSON.stringify(value) : String(value);

      return {
        account_id: accountId,
        question_id: questionId,
        answer_value: answerValue,
      };
    }).filter(Boolean) as Array<{ account_id: string; question_id: number; answer_value: string }>;

    // Insert or update answers
    const { error: answersError } = await supabase
      .from('answers')
      .upsert(answerRecords, {
        onConflict: 'account_id,question_id',
      });

    if (answersError) {
      console.error('Error saving answers:', answersError);
      return NextResponse.json(
        { error: 'Failed to save answers', details: answersError.message },
        { status: 500 }
      );
    }

    // Determine partner match for email notification
    const match = matchPartner(answers);

    // Send email notification (await with timeout to prevent function termination)
    console.log('[QUESTIONNAIRE] Attempting to send email notification...');
    
    const emailPromise = sendQuestionnaireNotification(answers, email, match)
      .then(result => {
        console.log('[QUESTIONNAIRE] Email notification result:', result);
        if (!result.success) {
          console.error('[QUESTIONNAIRE] Email notification failed:', result.error);
        } else {
          console.log('[QUESTIONNAIRE] ✅ Email notification sent successfully');
        }
        return result;
      })
      .catch(err => {
        console.error('[QUESTIONNAIRE] Unexpected error sending email notification:', err);
        console.error('[QUESTIONNAIRE] Error stack:', err instanceof Error ? err.stack : 'No stack');
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
      });
    
    // Await email with timeout (ensures function doesn't terminate before email completes)
    await sendEmailWithTimeout(emailPromise, 5000);

    return NextResponse.json({
      success: true,
      account_id: accountId,
      message: 'Questionnaire submitted successfully',
    });

  } catch (error) {
    console.error('Error in questionnaire submission:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


