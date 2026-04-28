# Partner Matching Logic

## Overview

The questionnaire now includes intelligent partner matching that routes SMBs to either **Credibly** or **Eagle Business Credit** based on their business profile, industry, and financing needs.

## Matching Rules

### Rule 1: B2C Businesses → Credibly
**Condition:** `business_model === 'B2C'`  
**Match:** Credibly  
**Reason:** Eagle Business Credit cannot serve B2C businesses. Credibly specializes in working capital for B2C companies.

**Example Scenarios:**
- Restaurant (B2C)
- Retail store (B2C)

---

### Rule 2: Construction Industry → Credibly
**Condition:** `industry === 'Construction'`  
**Match:** Credibly  
**Reason:** Eagle Business Credit explicitly excludes construction companies. Credibly specializes in working capital for construction businesses.

---

### Rule 3: Medical Industry → Credibly
**Condition:** `industry === 'Medical'`  
**Match:** Credibly  
**Reason:** Eagle Business Credit excludes medical insurance receivables. Credibly can serve medical businesses.

---

### Rule 4: B2B + Trucking/Staffing + Unpaid Invoices → Eagle (Sweet Spot)
**Condition:** 
- `business_model === 'B2B'`
- `industry === 'Trucking' OR 'Staffing'`
- `biggest_challenge === 'unpaid_invoices'`

**Match:** Eagle Business Credit  
**Product:** Invoice Factoring  
**Reason:** Eagle Business Credit specializes in invoice factoring for trucking and staffing companies. They can advance funds on your invoices regardless of your personal credit score.

**Example Scenarios:**
- Trucking company with unpaid invoices
- Staffing agency waiting on client payments

---

### Rule 5: B2B + Unpaid Invoices + Bad Credit → Eagle
**Condition:**
- `business_model === 'B2B'`
- `biggest_challenge === 'unpaid_invoices'`
- `personal_credit === 'Below 600' OR 'Prefer not to say' OR 'Fair'`

**Match:** Eagle Business Credit  
**Product:** Invoice Factoring  
**Reason:** Eagle Business Credit focuses on the quality of your customers rather than your personal credit. They can advance funds on your invoices even with lower credit scores.

---

### Rule 6: Startup with Invoices → Eagle
**Condition:**
- `revenue_3months === 'no revenue'`
- `biggest_challenge === 'unpaid_invoices'`
- Payment methods include invoices

**Match:** Eagle Business Credit  
**Product:** Invoice Factoring  
**Reason:** Eagle Business Credit can work with startups that have invoices, even without established revenue history. Credibly typically requires bank history.

**Example Scenarios:**
- New B2B company with contracts but no revenue yet
- Startup with unpaid invoices from customers

---

### Rule 7: B2B + Growth Capital → Credibly
**Condition:**
- `business_model === 'B2B'`
- `biggest_challenge === 'growth_capital'`

**Match:** Credibly  
**Product:** Term Loan / Working Capital  
**Reason:** For growth capital needs, Credibly offers term loans and working capital solutions that are better suited than invoice factoring.

**Example Scenarios:**
- B2B company needing capital for hiring
- Business looking to expand inventory
- Company seeking funds for expansion

---

### Rule 8: B2B + Unpaid Invoices + Good Credit → Credibly
**Condition:**
- `business_model === 'B2B'`
- `biggest_challenge === 'unpaid_invoices'`
- `personal_credit === 'Excellent' OR 'Good'`

**Match:** Credibly  
**Product:** Term Loan  
**Reason:** With good credit, Credibly can offer term loans which may be more cost-effective than invoice factoring for managing unpaid invoices.

**Example Scenarios:**
- B2B Consultant with 800 credit and $1M revenue
- Established B2B company with good credit seeking better rates

---

### Rule 9: Day-to-Day / Seasonal Needs → Credibly
**Condition:**
- `biggest_challenge === 'day_to_day' OR 'seasonal'`

**Match:** Credibly  
**Product:** MCA / Working Capital  
**Reason:** Credibly offers Business Cash Advances and working capital solutions that can provide faster access to funds for day-to-day needs.

---

### Rule 10: B2B + Unpaid Invoices (Default) → Eagle
**Condition:**
- `business_model === 'B2B'`
- `biggest_challenge === 'unpaid_invoices'`
- (No other specific rules match)

**Match:** Eagle Business Credit  
**Product:** Invoice Factoring  
**Reason:** Eagle Business Credit specializes in invoice factoring for B2B companies with cash flow gaps due to unpaid invoices.

---

### Default Rule: Credibly
**Condition:** No other rules match  
**Match:** Credibly  
**Product:** Working Capital / Term Loan  
**Reason:** Credibly offers a wide range of working capital and term loan solutions for various business types and industries.

---

## Questionnaire Changes

### New Questions Added

1. **Industry Question** (Section 1, Question 4)
   - Field: `industry`
   - Options: Trucking/Logistics, Staffing/Recruiting, Construction, Retail, Restaurant/Food Service, Medical/Healthcare, Wholesale/Distribution, Manufacturing, Professional Services, Technology/SaaS, Other
   - Required: Yes

### Modified Questions

1. **Biggest Challenge** (Section 3, Question 1)
   - Previously: "What will you primarily use the funds for?"
   - Now: "What is your biggest challenge?"
   - Field: `biggest_challenge` (changed from `capital_need`)
   - Options:
     - "Cash flow gaps due to unpaid invoices from customers" (`unpaid_invoices`)
     - "Need capital for growth (hiring, inventory, expansion)" (`growth_capital`)
     - "Covering day-to-day operating expenses" (`day_to_day`)
     - "Purchasing equipment or machinery" (`equipment`)
     - "Managing seasonal cash flow fluctuations" (`seasonal`)

## Partner Information

### Eagle Business Credit
- **Best For:** B2B companies with cash flow gaps due to unpaid invoices
- **Focus:** Quality of customers, not personal credit
- **Specialties:**
  - Invoice Factoring
  - B2B Companies
  - Trucking & Staffing
  - No Personal Credit Requirements
- **Exclusions:**
  - B2C businesses
  - Construction
  - Medical (insurance billing)

### Credibly
- **Best For:** Working capital, MCA, and term loans
- **Focus:** Daily balances and personal credit
- **Specialties:**
  - Working Capital
  - Business Cash Advances
  - Term Loans
  - B2B & B2C
- **Industries:** Wide range of industries

## Analytics Tracking

The following events are tracked for partner matching:

1. **`prequal_routing_result`** - Fired when a recommendation is provided
   - Parameters: `recommended_product`, `revenue_bucket`, `business_type`

2. **`lender_click`** - Fired when user clicks "Learn More" about a partner
   - Parameters: `lender_name`, `product_type`

## Implementation Details

### Files Modified
- `src/app/questionnaire/page.tsx` - Added industry question, updated challenge question, integrated matching logic
- `src/lib/partnerMatching.ts` - New file containing matching logic

### Matching Function
```typescript
matchPartner(answers: QuestionnaireAnswers): MatchingResult
```

Returns:
- `partner`: 'Credibly' | 'Eagle Business Credit' | null
- `productType`: String describing the recommended product
- `reason`: String explaining why this match was made
- `confidence`: 'high' | 'medium' | 'low'

## Testing Scenarios

Based on your provided scenarios:

| Scenario | Lead Profile | Expected Match | Status |
|----------|--------------|----------------|--------|
| 1 | B2C (Restaurant/Retail) | Credibly | ✅ Rule 1 |
| 2 | Construction Company | Credibly | ✅ Rule 2 |
| 3 | Medical (Insurance Billing) | Credibly | ✅ Rule 3 |
| 4 | Trucking/Staffing (Bad Credit) | Eagle | ✅ Rule 4 or 5 |
| 5 | Startup (0 Revenue, has contract) | Eagle | ✅ Rule 6 |
| 6 | B2B Service (Good Credit, hates factoring) | Credibly | ✅ Rule 8 |
| 7 | Wholesaler (Needs cash in 24h) | Credibly | ✅ Rule 9 |

## Future Enhancements

### Gap Identified: "The Healthy B2B Borrower"
If you are a B2B Consultant with 800 Credit and $1M revenue, you might not want Factoring (Eagle) because it's operationally heavy, and you might find Credibly's MCA rates too high.

**Short term:** Route them to Credibly (Term Loan product) - ✅ Implemented (Rule 8)

**Long term:** Consider adding a "Prime Lender" partner (like a bank integration or Funding Circle) to fill this gap.

## Notes

- The matching logic is deterministic and rule-based
- Rules are evaluated in order, first match wins
- Confidence levels help identify edge cases that may need manual review
- All matching decisions are tracked in analytics for optimization

