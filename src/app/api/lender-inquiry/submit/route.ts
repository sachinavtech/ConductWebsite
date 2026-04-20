import { NextRequest, NextResponse } from 'next/server';
import { sendEmailNotification } from '@/lib/email';

async function sendEmailWithTimeout(
  emailPromise: Promise<{ success: boolean; error?: string }>,
  timeoutMs: number = 5000
): Promise<{ success: boolean; error?: string }> {
  const timeoutPromise = new Promise<{ success: boolean; error?: string }>((resolve) => {
    setTimeout(() => resolve({ success: false, error: 'Email timeout' }), timeoutMs);
  });

  try {
    const result = await Promise.race([emailPromise, timeoutPromise]);
    return result;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { name, company, email, subject, message } = body;

    if (!name || !company || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required: name, company, email, subject, message' },
        { status: 400 }
      );
    }

    const emailBody = `
New MCA Lender Network Inquiry

From
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${name}
Company: ${company}
Email: ${email}

Subject: ${subject}

Message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${message}

Submitted: ${new Date().toLocaleString()}
    `.trim();

    const emailPromise = sendEmailNotification(
      `MCA Lender Inquiry: ${subject}`,
      emailBody
    );

    const result = await sendEmailWithTimeout(emailPromise, 5000);

    if (!result.success) {
      console.error('[LENDER_INQUIRY] Email send failed:', result.error);
    }

    return NextResponse.json({
      success: true,
      message: 'Inquiry submitted successfully',
    });
  } catch (error) {
    console.error('Error in lender inquiry submission:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
