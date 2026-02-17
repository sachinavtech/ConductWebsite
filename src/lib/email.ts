/**
 * Email utility for sending notifications
 * Uses Resend API for reliable email delivery
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFICATION_EMAIL = 'sachin@conductfinance.com';

/**
 * Format risk score data for email
 */
function formatRiskScoreEmail(data: Record<string, any>): string {
  return `
New Conduct Risk Score Submission

Part 1: Business Information (KYB/State Verification)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Legal Business Name: ${data.legal_business_name || 'N/A'}
Doing Business As (DBA): ${data.doing_business_as || 'N/A'}
State of Incorporation: ${data.state_of_incorporation || 'N/A'}
Entity Type: ${data.entity_type || 'N/A'}
EIN (Federal Tax ID): ${data.ein || 'N/A'}
Business Physical Address: ${data.business_physical_address || 'N/A'}
Date of Formation: ${data.date_of_formation || 'N/A'}

Part 2: Digital Presence & Operations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Corporate Website URL: ${data.corporate_website_url || 'N/A'}
LinkedIn Company Page: ${data.linkedin_company_page_url || 'N/A'}
Facebook Business Page: ${data.facebook_business_page_url || 'N/A'}
Yelp/Google Business Profile: ${data.yelp_google_business_profile_url || 'N/A'}
Business Phone Number: ${data.business_phone_number || 'N/A'}
Primary Bank Account (Last 4): ${data.primary_bank_account_last_4 || 'N/A'}

Contact Information
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: ${data.email || 'N/A'}

Submitted: ${new Date().toLocaleString()}
  `.trim();
}

/**
 * Format questionnaire/match data for email
 */
function formatQuestionnaireEmail(answers: Record<string, any>, email: string, match?: any): string {
  const formatValue = (value: any): string => {
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value || 'N/A');
  };

  let emailContent = `
New Lending Match Questionnaire Submission

Contact Information
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: ${email}

Questionnaire Answers
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  // Add all answers
  Object.entries(answers).forEach(([key, value]) => {
    if (key !== 'email') { // Don't duplicate email
      const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      emailContent += `${formattedKey}: ${formatValue(value)}\n`;
    }
  });

  // Add match information if available
  if (match && match.partner) {
    emailContent += `
\nMatch Recommendation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Recommended Partner: ${match.partner}
Product Type: ${match.productType}
Reason: ${match.reason}
Confidence: ${match.confidence}
`;
  }

  emailContent += `\nSubmitted: ${new Date().toLocaleString()}`;

  return emailContent.trim();
}

/**
 * Send email using Resend API
 */
export async function sendEmailNotification(
  subject: string,
  body: string,
  to: string = NOTIFICATION_EMAIL
): Promise<{ success: boolean; error?: string }> {
  // If Resend API key is not configured, log to console and return false
  if (!RESEND_API_KEY) {
    const errorMsg = 'RESEND_API_KEY not configured in environment variables. Email notification not sent.';
    console.error('='.repeat(80));
    console.error('EMAIL NOTIFICATION FAILED:', errorMsg);
    console.error('To fix: Add RESEND_API_KEY to your .env.local file');
    console.error('Would send email to:', to);
    console.error('Subject:', subject);
    console.error('Body preview:', body.substring(0, 200) + '...');
    console.error('='.repeat(80));
    return { success: false, error: errorMsg };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev', // Use Resend's default domain for testing
        to: [to],
        subject: subject,
        text: body,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMsg = `Resend API error: ${JSON.stringify(error)}`;
      console.error('='.repeat(80));
      console.error('EMAIL NOTIFICATION FAILED:', errorMsg);
      console.error('Response status:', response.status);
      console.error('Response body:', error);
      console.error('='.repeat(80));
      return { success: false, error: errorMsg };
    }

    const result = await response.json();
    console.log('✅ Email sent successfully to', to, '- Resend ID:', result.id);
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('='.repeat(80));
    console.error('EMAIL NOTIFICATION FAILED:', errorMsg);
    console.error('Full error:', error);
    console.error('='.repeat(80));
    return { success: false, error: errorMsg };
  }
}

/**
 * Send risk score submission notification
 */
export async function sendRiskScoreNotification(data: Record<string, any>): Promise<{ success: boolean; error?: string }> {
  const emailBody = formatRiskScoreEmail(data);
  return await sendEmailNotification(
    `New Conduct Risk Score Submission - ${data.legal_business_name || 'Unknown Business'}`,
    emailBody
  );
}

/**
 * Send questionnaire/match submission notification
 */
export async function sendQuestionnaireNotification(
  answers: Record<string, any>,
  email: string,
  match?: any
): Promise<{ success: boolean; error?: string }> {
  const emailBody = formatQuestionnaireEmail(answers, email, match);
  return await sendEmailNotification(
    `New Lending Match Submission - ${email}`,
    emailBody
  );
}

