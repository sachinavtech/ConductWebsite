/**
 * Partner Matching Logic
 * Matches SMBs to Credibly or Eagle Business Credit based on questionnaire answers
 */

export type Partner = 'Credibly' | 'Eagle Business Credit' | null;

export interface MatchingResult {
  partner: Partner;
  productType: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

interface QuestionnaireAnswers {
  business_model?: string;
  industry?: string;
  revenue_3months?: string;
  biggest_challenge?: string;
  personal_credit?: string;
  business_age?: string;
  payment_methods?: string | string[];
  [key: string]: string | string[] | undefined;
}

/**
 * Check if payment methods include invoices
 */
function hasInvoicePayments(paymentMethods: string | string[] | undefined): boolean {
  if (!paymentMethods) return false;
  const methods = Array.isArray(paymentMethods) ? paymentMethods : [paymentMethods];
  return methods.some(m => m.toLowerCase().includes('invoice'));
}

/**
 * Determine the best partner match based on questionnaire answers
 */
export function matchPartner(answers: QuestionnaireAnswers): MatchingResult {
  const businessModel = answers.business_model;
  const industry = answers.industry;
  const revenue = answers.revenue_3months;
  const challenge = answers.biggest_challenge;
  const credit = answers.personal_credit;
  const businessAge = answers.business_age;
  const paymentMethods = answers.payment_methods;

  // Rule 1: B2C → Credibly (Eagle cannot do B2C)
  if (businessModel === 'B2C') {
    return {
      partner: 'Credibly',
      productType: 'Working Capital / MCA',
      reason: 'Eagle Business Credit cannot serve B2C businesses. Credibly specializes in working capital for B2C companies.',
      confidence: 'high'
    };
  }

  // Rule 2: Construction → Credibly (Eagle explicitly excludes)
  if (industry === 'Construction') {
    return {
      partner: 'Credibly',
      productType: 'Working Capital / Term Loan',
      reason: 'Eagle Business Credit excludes construction companies. Credibly specializes in working capital for construction businesses.',
      confidence: 'high'
    };
  }

  // Rule 3: Medical (insurance billing) → Credibly (Eagle excludes medical insurance receivables)
  if (industry === 'Medical') {
    return {
      partner: 'Credibly',
      productType: 'Working Capital / Term Loan',
      reason: 'Eagle Business Credit excludes medical insurance receivables. Credibly can serve medical businesses.',
      confidence: 'high'
    };
  }

  // Rule 4: B2B + Trucking/Staffing + unpaid invoices → Eagle (sweet spot)
  if (
    businessModel === 'B2B' &&
    (industry === 'Trucking' || industry === 'Staffing') &&
    challenge === 'unpaid_invoices'
  ) {
    return {
      partner: 'Eagle Business Credit',
      productType: 'Invoice Factoring',
      reason: 'Eagle Business Credit specializes in invoice factoring for trucking and staffing companies. They can advance funds on your invoices regardless of your personal credit score.',
      confidence: 'high'
    };
  }

  // Rule 5: B2B + unpaid invoices + (bad credit OR no credit) → Eagle
  if (
    businessModel === 'B2B' &&
    challenge === 'unpaid_invoices' &&
    (credit === 'Below 600' || credit === 'Prefer not to say' || credit === 'Fair')
  ) {
    return {
      partner: 'Eagle Business Credit',
      productType: 'Invoice Factoring',
      reason: 'Eagle Business Credit focuses on the quality of your customers rather than your personal credit. They can advance funds on your invoices even with lower credit scores.',
      confidence: 'high'
    };
  }

  // Rule 6: Startup (0 revenue, has contract/invoices) → Eagle (just needs invoice)
  if (
    revenue === 'no revenue' &&
    challenge === 'unpaid_invoices' &&
    hasInvoicePayments(paymentMethods)
  ) {
    return {
      partner: 'Eagle Business Credit',
      productType: 'Invoice Factoring',
      reason: 'Eagle Business Credit can work with startups that have invoices, even without established revenue history. Credibly typically requires bank history.',
      confidence: 'medium'
    };
  }

  // Rule 7: B2B + growth capital → Credibly (prefers loan over factoring)
  if (
    businessModel === 'B2B' &&
    challenge === 'growth_capital'
  ) {
    return {
      partner: 'Credibly',
      productType: 'Term Loan / Working Capital',
      reason: 'For growth capital needs, Credibly offers term loans and working capital solutions that are better suited than invoice factoring.',
      confidence: 'high'
    };
  }

  // Rule 8: B2B + unpaid invoices + good credit → Credibly (term loan preferred over factoring)
  if (
    businessModel === 'B2B' &&
    challenge === 'unpaid_invoices' &&
    (credit === 'Excellent' || credit === 'Good')
  ) {
    return {
      partner: 'Credibly',
      productType: 'Term Loan',
      reason: 'With good credit, Credibly can offer term loans which may be more cost-effective than invoice factoring for managing unpaid invoices.',
      confidence: 'medium'
    };
  }

  // Rule 9: Needs cash in 24h → Credibly (MCAs are faster)
  // Note: This would require a funds_timing question, but we can infer from other signals
  if (
    challenge === 'day_to_day' ||
    challenge === 'seasonal'
  ) {
    return {
      partner: 'Credibly',
      productType: 'MCA / Working Capital',
      reason: 'Credibly offers Merchant Cash Advances and working capital solutions that can provide faster access to funds for day-to-day needs.',
      confidence: 'medium'
    };
  }

  // Rule 10: B2B + unpaid invoices (default case) → Eagle
  if (
    businessModel === 'B2B' &&
    challenge === 'unpaid_invoices'
  ) {
    return {
      partner: 'Eagle Business Credit',
      productType: 'Invoice Factoring',
      reason: 'Eagle Business Credit specializes in invoice factoring for B2B companies with cash flow gaps due to unpaid invoices.',
      confidence: 'medium'
    };
  }

  // Default: Credibly (broader range of industries and products)
  return {
    partner: 'Credibly',
    productType: 'Working Capital / Term Loan',
    reason: 'Credibly offers a wide range of working capital and term loan solutions for various business types and industries.',
    confidence: 'low'
  };
}

/**
 * Get partner information for display
 */
export function getPartnerInfo(partner: Partner) {
  if (partner === 'Eagle Business Credit') {
    return {
      name: 'Eagle Business Credit',
      description: 'Best for B2B companies with cash flow gaps due to unpaid invoices. They focus on the quality of your customers rather than your personal credit score.',
      specialties: [
        'Invoice Factoring',
        'B2B Companies',
        'Trucking & Staffing',
        'No Personal Credit Requirements'
      ],
      website: 'https://www.eaglebusinesscredit.com', // Update with actual URL
    };
  }

  if (partner === 'Credibly') {
    return {
      name: 'Credibly',
      description: 'Focuses on working capital, MCA, and term loans. They serve both B2B and B2C businesses across a wide range of industries.',
      specialties: [
        'Working Capital',
        'Merchant Cash Advances',
        'Term Loans',
        'B2B & B2C'
      ],
      website: 'https://www.credibly.com', // Update with actual URL
    };
  }

  return null;
}

