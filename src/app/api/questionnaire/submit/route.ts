import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendApplicationNotification } from "@/lib/email";
import {
  isAllowedBusinessBank,
  isAllowedMonthlyDeposits,
  isAllowedTib,
  splitFullNameToFirstLast,
  submitCrediblyHubspotLead,
} from "@/lib/crediblyHubspotLead";

async function sendEmailWithTimeout(
  emailPromise: Promise<{ success: boolean; error?: string }>,
  timeoutMs: number = 5000
): Promise<{ success: boolean; error?: string }> {
  const timeoutPromise = new Promise<{ success: boolean; error?: string }>((resolve) => {
    setTimeout(() => resolve({ success: false, error: "Email timeout" }), timeoutMs);
  });
  try {
    return await Promise.race([emailPromise, timeoutPromise]);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const {
      ein,
      businessLegalName: businessLegalNameRaw,
      businessBankAccount,
      timeInBusiness,
      monthlyDeposits,
      ownerName,
      ownerSSN,
      ownershipPercentage,
      email,
      phone,
      advanceAmount,
      consentGiven,
      consentTimestamp,
    } = body;

    const businessLegalName =
      typeof businessLegalNameRaw === "string" ? businessLegalNameRaw.trim() : "";

    if (
      !ein ||
      !businessLegalName ||
      !businessBankAccount ||
      !timeInBusiness ||
      !monthlyDeposits ||
      !ownerName ||
      !ownerSSN ||
      !ownershipPercentage ||
      !email ||
      !phone ||
      !advanceAmount ||
      !consentGiven
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isAllowedBusinessBank(businessBankAccount)) {
      return NextResponse.json({ error: "Invalid business bank account selection" }, { status: 400 });
    }
    if (!isAllowedTib(timeInBusiness)) {
      return NextResponse.json({ error: "Invalid time in business selection" }, { status: 400 });
    }
    if (!isAllowedMonthlyDeposits(monthlyDeposits)) {
      return NextResponse.json({ error: "Invalid monthly deposits selection" }, { status: 400 });
    }

    const bankData =
      body.bankData && typeof body.bankData === "object" && body.bankData.method === "plaid"
        ? body.bankData
        : body.bankData && typeof body.bankData === "object" && body.bankData.method === "upload"
          ? body.bankData
          : { method: "none" as const };

    if (bankData.method === "upload") {
      if (!bankData.bankStatements || !Array.isArray(bankData.bankStatements) || bankData.bankStatements.length < 3) {
        return NextResponse.json({ error: "At least 3 bank statements are required" }, { status: 400 });
      }
    } else if (bankData.method === "plaid") {
      if (!bankData.plaidAccounts || !Array.isArray(bankData.plaidAccounts) || bankData.plaidAccounts.length === 0) {
        return NextResponse.json({ error: "At least one Plaid-linked bank account is required" }, { status: 400 });
      }
    }

    const phoneDigits = String(phone).replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      return NextResponse.json({ error: "Phone must be 10 digits" }, { status: 400 });
    }

    const crediblyLeadId = randomUUID();

    let accountId: string | null = null;

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data: existingAccount } = await supabase.from("accounts").select("account_id").eq("email", email).single();

      if (existingAccount) {
        accountId = existingAccount.account_id;
      } else {
        const { data: newAccount, error: accountError } = await supabase
          .from("accounts")
          .insert({
            email,
            password_hash: "mca_application",
          })
          .select("account_id")
          .single();

        if (accountError) {
          console.error("Error creating account:", accountError);
        } else {
          accountId = newAccount.account_id;
        }
      }

      if (accountId) {
        const bankMeta =
          bankData.method === "plaid"
            ? bankData.plaidAccounts
            : bankData.method === "upload"
              ? bankData.bankStatements
              : [];

        const { error: appError } = await supabase.from("mca_applications").insert({
          account_id: accountId,
          ein,
          owner_name: ownerName,
          owner_ssn_last4: ownerSSN.slice(-4),
          ownership_percentage: ownershipPercentage,
          phone,
          advance_amount: advanceAmount,
          bank_data_method: bankData.method,
          bank_statements_meta: bankMeta,
          consent_given: consentGiven,
          consent_timestamp: consentTimestamp,
        });

        if (appError) {
          console.warn("mca_applications table may not exist yet:", appError.message);
        }
      }
    }

    console.log("[APPLICATION] Sending email notification...");
    const emailPromise = sendApplicationNotification({
      ein,
      businessLegalName,
      businessBankAccount,
      timeInBusiness,
      monthlyDeposits,
      ownerName,
      ownershipPercentage,
      email,
      phone,
      advanceAmount,
      bankData,
      consentTimestamp,
      crediblyLeadId,
    });

    await sendEmailWithTimeout(emailPromise, 5000);

    const { firstName, lastName } = splitFullNameToFirstLast(String(ownerName));
    const hubResult = await submitCrediblyHubspotLead({
      subpublisherId: crediblyLeadId.replace(/-/g, ""),
      firstName: firstName || "Applicant",
      lastName: lastName || "-",
      email: String(email).toLowerCase().trim(),
      phoneDigits,
      company: businessLegalName,
      tib: timeInBusiness,
      businessBankAccount,
      monthlyDeposits,
      utmSource: process.env.CREDIBLY_HUBSPOT_UTM_SOURCE || "conduct_finance",
    });

    if (!hubResult.ok) {
      console.error("[APPLICATION] Credibly HubSpot submit failed:", hubResult.status, hubResult.body);
    }

    return NextResponse.json({
      success: true,
      account_id: accountId,
      credibly_lead_id: crediblyLeadId,
      credibly_hubspot_ok: hubResult.ok,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Error in application submission:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
