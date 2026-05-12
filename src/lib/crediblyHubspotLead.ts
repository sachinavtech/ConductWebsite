/**
 * Credibly partner lead capture via HubSpot Forms API (public form submission).
 *
 * Env (optional):
 * - CREDIBLY_HUBSPOT_UTM_SOURCE — value for `utm_source` (default: conduct_finance).
 *   If your HubSpot field internal name has a trailing space (rare), rename the field
 *   in HubSpot or map via a workflow; we send `utm_source` without a trailing space.
 *
 * @see https://developers.hubspot.com/docs/api/marketing/forms
 */

export const CREDIBLY_HUBSPOT_PORTAL_ID = "21784757";
export const CREDIBLY_HUBSPOT_FORM_GUID = "a6a715a5-b3d6-4dcb-999d-fc30bdef8703";

export const HUBSPOT_TIB_VALUES = [
  "Less than 3 months",
  "3 to 6 months",
  "6 months to 1 year",
  "1 to 2 years",
  "2 to 5 years",
  "Greater than 5 years",
] as const;

export const HUBSPOT_BUSINESS_BANK_VALUES = ["Yes", "No"] as const;

/** Values must match the Credibly / HubSpot form picklist exactly. */
export const HUBSPOT_MONTHLY_DEPOSITS_VALUES = [
  "Less than $5,000",
  "$5,000 to $15,000",
  "$15,000 to $25,000",
  "$25,000 to $50,000",
  "$50,000 to $100,000",
  "$100,000 to $200,000",
  "Over $500,000",
] as const;

export type HubspotTib = (typeof HUBSPOT_TIB_VALUES)[number];
export type HubspotBusinessBank = (typeof HUBSPOT_BUSINESS_BANK_VALUES)[number];
export type HubspotMonthlyDeposits = (typeof HUBSPOT_MONTHLY_DEPOSITS_VALUES)[number];

export interface CrediblyHubspotLeadInput {
  /** Unique lead / sub-publisher id (e.g. UUID). */
  subpublisherId: string;
  firstName: string;
  lastName: string;
  email: string;
  /** 10-digit US national number (no +1). */
  phoneDigits: string;
  company: string;
  tib: HubspotTib;
  businessBankAccount: HubspotBusinessBank;
  monthlyDeposits: HubspotMonthlyDeposits;
  utmSource?: string;
}

function field(name: string, value: string): { objectTypeId: string; name: string; value: string } {
  return { objectTypeId: "0-1", name, value };
}

/** Split owner full legal name into HubSpot first / last. */
export function splitFullNameToFirstLast(full: string): { firstName: string; lastName: string } {
  const t = full.trim().replace(/\s+/g, " ");
  if (!t) return { firstName: "", lastName: "" };
  const i = t.indexOf(" ");
  if (i === -1) return { firstName: t, lastName: "" };
  return { firstName: t.slice(0, i), lastName: t.slice(i + 1) };
}

export function isAllowedTib(v: string): v is HubspotTib {
  return (HUBSPOT_TIB_VALUES as readonly string[]).includes(v);
}

export function isAllowedBusinessBank(v: string): v is HubspotBusinessBank {
  return (HUBSPOT_BUSINESS_BANK_VALUES as readonly string[]).includes(v);
}

export function isAllowedMonthlyDeposits(v: string): v is HubspotMonthlyDeposits {
  return (HUBSPOT_MONTHLY_DEPOSITS_VALUES as readonly string[]).includes(v);
}

export function buildCrediblyHubspotPayload(input: CrediblyHubspotLeadInput): {
  fields: { objectTypeId: string; name: string; value: string }[];
  context: { pageUri: string; pageName: string };
} {
  const utm = input.utmSource?.trim() || "conduct_finance";
  return {
    fields: [
      field("firstname", input.firstName),
      field("lastname", input.lastName),
      field("email", input.email),
      field("phone", input.phoneDigits),
      field("company", input.company),
      field("tib", input.tib),
      field("business_bank_account_drop_down", input.businessBankAccount),
      field("monthly_deposits", input.monthlyDeposits),
      field("subpublisherid", input.subpublisherId),
      field("utm_source", utm),
    ],
    context: {
      pageUri: "https://conductfinance.com/questionnaire",
      pageName: "Conduct Finance — MCA Questionnaire",
    },
  };
}

const SUBMIT_URL = `https://api.hsforms.com/submissions/v3/integration/submit/${CREDIBLY_HUBSPOT_PORTAL_ID}/${CREDIBLY_HUBSPOT_FORM_GUID}`;

export async function submitCrediblyHubspotLead(
  input: CrediblyHubspotLeadInput
): Promise<{ ok: true } | { ok: false; status: number; body: string }> {
  const body = buildCrediblyHubspotPayload(input);
  const res = await fetch(SUBMIT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    return { ok: false, status: res.status, body: text.slice(0, 2000) };
  }
  return { ok: true };
}
