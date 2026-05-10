import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendCrediblyLeadNotification } from "@/lib/email";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
    const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
    const businessName = typeof body.businessName === "string" ? body.businessName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phoneRaw = typeof body.phone === "string" ? body.phone : "";
    const monthlyRevenueRange =
      typeof body.monthlyRevenueRange === "string" ? body.monthlyRevenueRange.trim() : "";
    const desiredAmount = typeof body.desiredAmount === "string" ? body.desiredAmount.trim() : "";
    const source =
      typeof body.source === "string" && body.source.trim()
        ? body.source.trim().slice(0, 120)
        : "homepage_credibly_modal";

    if (!firstName || !lastName || !businessName || !email || !phoneRaw || !monthlyRevenueRange || !desiredAmount) {
      return NextResponse.json(
        {
          error:
            "All fields are required: firstName, lastName, businessName, email, phone, monthlyRevenueRange, desiredAmount",
        },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    const phoneDigits = phoneRaw.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      return NextResponse.json({ error: "Phone must be 10 digits." }, { status: 400 });
    }

    let savedToDb = false;

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { error: insertError } = await supabase.from("credibly_leads").insert({
        first_name: firstName,
        last_name: lastName,
        business_name: businessName,
        email: email.toLowerCase(),
        phone: phoneDigits,
        monthly_revenue_range: monthlyRevenueRange,
        desired_amount: desiredAmount,
        source,
      });

      if (insertError) {
        console.error("[CREDIBLY_LEADS] Supabase insert failed:", insertError);
        return NextResponse.json(
          { error: "Could not save lead. Please try again or contact support.", details: insertError.message },
          { status: 500 }
        );
      }
      savedToDb = true;
    } else {
      console.warn("[CREDIBLY_LEADS] Supabase not configured — attempting email notification only.");
    }

    const emailResult = await sendCrediblyLeadNotification({
      firstName,
      lastName,
      businessName,
      email: email.toLowerCase(),
      phone: phoneDigits,
      monthlyRevenueRange,
      desiredAmount,
      source,
    });

    if (!savedToDb && !emailResult.success) {
      return NextResponse.json(
        {
          error:
            "Lead capture is not fully configured. Add Supabase credentials and/or RESEND_API_KEY, or try again later.",
        },
        { status: 503 }
      );
    }

    if (!emailResult.success) {
      console.warn("[CREDIBLY_LEADS] Email notification failed:", emailResult.error);
    }

    return NextResponse.json({
      success: true,
      saved: savedToDb,
      emailSent: emailResult.success,
      message: savedToDb ? "Lead saved successfully." : "Lead emailed successfully.",
    });
  } catch (error) {
    console.error("[CREDIBLY_LEADS] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
