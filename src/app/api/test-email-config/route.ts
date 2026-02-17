import { NextResponse } from 'next/server';

/**
 * Test endpoint to check if RESEND_API_KEY is configured
 * Visit: http://localhost:3000/api/test-email-config
 */
export async function GET(): Promise<NextResponse> {
  const hasKey = !!process.env.RESEND_API_KEY;
  const keyStartsWithRe = process.env.RESEND_API_KEY?.startsWith('re_') || false;
  const keyLength = process.env.RESEND_API_KEY?.length || 0;
  
  return NextResponse.json({
    configured: hasKey,
    keyExists: hasKey,
    keyStartsWithRe: keyStartsWithRe,
    keyLength: keyLength,
    message: hasKey 
      ? `✅ RESEND_API_KEY is configured! (Length: ${keyLength}, Valid format: ${keyStartsWithRe})`
      : '❌ RESEND_API_KEY is NOT configured. Add it to .env.local and restart the server.',
    instructions: hasKey 
      ? 'If emails still fail, check the Resend dashboard for API errors.'
      : '1. Add RESEND_API_KEY=re_your_key_here to .env.local\n2. Restart your dev server (npm run dev)\n3. Check this endpoint again',
  });
}

