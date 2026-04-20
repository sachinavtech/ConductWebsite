/**
 * Email utility for sending notifications
 * Uses Resend API for reliable email delivery
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFICATION_EMAIL = 'sachin@conductfinance.com';

interface BankDataPlaid {
  method: 'plaid';
  plaidAccounts: { id: string; name: string; institution: string; mask: string; type: string; monthsCovered: number }[];
}

interface BankDataUpload {
  method: 'upload';
  bankStatements: { fileName: string; month: string; year: string; sizeKB: number }[];
}

type BankData = BankDataPlaid | BankDataUpload;

interface ApplicationData {
  ein: string;
  ownerName: string;
  ownershipPercentage: string;
  email: string;
  phone: string;
  advanceAmount: string;
  bankData: BankData;
  consentTimestamp: string;
}

function formatBankSection(bankData: BankData): string {
  if (bankData.method === 'plaid') {
    const accounts = bankData.plaidAccounts
      .map(a => `  ${a.institution} — ${a.name} (...${a.mask}) — ${a.monthsCovered} months of history`)
      .join('\n');
    return `Bank Data (Plaid Linked)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Method: Plaid (instant bank connection)
${accounts}`;
  }

  const statements = bankData.bankStatements
    .map(s => `  ${s.fileName} — ${s.month} ${s.year} (${s.sizeKB} KB)`)
    .join('\n');
  return `Bank Statements (${bankData.bankStatements.length} files uploaded)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Method: PDF Upload
${statements}`;
}

function formatApplicationEmail(data: ApplicationData): string {
  return `
New MCA Application

Contact
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: ${data.email}
Phone: ${data.phone}

Business
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EIN: ${data.ein.replace(/(\d{2})(\d+)/, '$1-$2')}

Owner
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${data.ownerName}
Ownership: ${data.ownershipPercentage}%
SSN: [Provided — not shown in email]

Funding
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Desired Advance: ${data.advanceAmount}

${formatBankSection(data.bankData)}

Authorization
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Consent given: Yes
Consent timestamp: ${data.consentTimestamp}

Next Steps
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Middesk business verification via EIN
→ Soft credit pull via SSN
→ ${data.bankData.method === 'plaid' ? 'Plaid bank account analysis' : 'Bank statement analysis via Ocrolus'}
→ Match to lender network based on advance size + profile

Submitted: ${new Date().toLocaleString()}
  `.trim();
}

export async function sendEmailNotification(
  subject: string,
  body: string,
  to: string = NOTIFICATION_EMAIL
): Promise<{ success: boolean; error?: string }> {
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
    console.log('[EMAIL] Sending email to:', to);
    console.log('[EMAIL] Subject:', subject);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: [to],
        subject: subject,
        text: body,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let error: { message?: string; error?: string };
      try {
        error = JSON.parse(errorText) as { message?: string; error?: string };
      } catch {
        error = { message: errorText };
      }
      const errorMsg = `Resend API error: ${JSON.stringify(error)}`;
      console.error('[EMAIL] EMAIL NOTIFICATION FAILED:', errorMsg);
      return { success: false, error: errorMsg };
    }

    const result = await response.json() as { id?: string };
    console.log('[EMAIL] Email sent successfully - Resend ID:', result.id || 'N/A');
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[EMAIL] EMAIL NOTIFICATION FAILED:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

export async function sendApplicationNotification(
  data: ApplicationData
): Promise<{ success: boolean; error?: string }> {
  const method = data.bankData.method === 'plaid' ? 'Plaid' : 'Upload';
  const emailBody = formatApplicationEmail(data);
  return await sendEmailNotification(
    `MCA Application [${method}] — ${data.advanceAmount} — ${data.email}`,
    emailBody
  );
}
