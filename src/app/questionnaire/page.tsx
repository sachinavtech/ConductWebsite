"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { trackPrequalStart, trackCompletion } from "@/lib/analytics";
import { messageFromPossibleJsonHtmlError, parseFetchJson } from "@/lib/parseFetchJson";
import {
  HUBSPOT_BUSINESS_BANK_VALUES,
  HUBSPOT_MONTHLY_DEPOSITS_VALUES,
  HUBSPOT_TIB_VALUES,
  isAllowedBusinessBank,
  isAllowedMonthlyDeposits,
  isAllowedTib,
} from "@/lib/crediblyHubspotLead";

type AppStep = "application" | "declined" | "submitted";

const OWNERSHIP_OPTIONS = [
  { value: "100", label: "100% (Sole owner)" },
  { value: "75-99", label: "75% to 99%" },
  { value: "51-74", label: "51% to 74%" },
  { value: "50", label: "50%" },
  { value: "25-49", label: "25% to 49%" },
  { value: "< 25", label: "Less than 25%" },
];

function formatSSN(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

function formatEIN(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function formatCurrency(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return "$" + Number(digits).toLocaleString("en-US");
}

function parseCurrencyToNumber(value: string): number {
  return Number(value.replace(/\D/g, "")) || 0;
}

// ── Pre-approval validation ──
interface PreApprovalErrors {
  ein?: string;
  businessLegalName?: string;
  businessBankAccount?: string;
  timeInBusiness?: string;
  monthlyDeposits?: string;
  ownerName?: string;
  ownerSSN?: string;
  ownershipPct?: string;
  email?: string;
  phone?: string;
  advanceAmount?: string;
  consent?: string;
}

function validatePreApproval(
  ein: string,
  businessLegalName: string,
  businessBankAccount: string,
  timeInBusiness: string,
  monthlyDeposits: string,
  ownerName: string,
  ownerSSN: string,
  ownershipPct: string,
  email: string,
  phone: string,
  advanceAmount: string,
  consent: boolean
): { valid: boolean; errors: PreApprovalErrors; declineReason?: string } {
  const errors: PreApprovalErrors = {};

  const einDigits = ein.replace(/\D/g, "");
  if (einDigits.length !== 9) errors.ein = "EIN must be 9 digits.";
  if (einDigits.length === 9 && einDigits.startsWith("00")) errors.ein = "EIN cannot start with 00.";

  if (!businessLegalName.trim()) {
    errors.businessLegalName = "Business legal name is required.";
  } else if (businessLegalName.trim().length < 2) {
    errors.businessLegalName = "Please enter your full business legal name.";
  }

  if (!businessBankAccount) {
    errors.businessBankAccount = "Please indicate whether you have a business bank account.";
  } else if (!isAllowedBusinessBank(businessBankAccount)) {
    errors.businessBankAccount = "Please select a valid option.";
  }

  if (!timeInBusiness) {
    errors.timeInBusiness = "Please select how long you have been in business.";
  } else if (!isAllowedTib(timeInBusiness)) {
    errors.timeInBusiness = "Please select a valid time in business.";
  }

  if (!monthlyDeposits) {
    errors.monthlyDeposits = "Please select average monthly deposits.";
  } else if (!isAllowedMonthlyDeposits(monthlyDeposits)) {
    errors.monthlyDeposits = "Please select a valid deposit range.";
  }

  if (!ownerName.trim()) {
    errors.ownerName = "Owner legal name is required.";
  } else if (ownerName.trim().split(/\s+/).length < 2) {
    errors.ownerName = "Please enter your full legal name (first and last).";
  }

  const ssnDigits = ownerSSN.replace(/\D/g, "");
  if (ssnDigits.length !== 9) errors.ownerSSN = "SSN must be 9 digits.";
  if (ssnDigits.length === 9) {
    if (ssnDigits.startsWith("9") || ssnDigits.startsWith("000") || ssnDigits.substring(3, 5) === "00" || ssnDigits.substring(5) === "0000") {
      errors.ownerSSN = "Please enter a valid SSN.";
    }
  }

  if (!ownershipPct) errors.ownershipPct = "Please select ownership percentage.";

  if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Valid business email is required.";
  }

  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length !== 10) {
    errors.phone = "Phone must be 10 digits.";
  } else if (phoneDigits.startsWith("0") || phoneDigits.startsWith("1")) {
    errors.phone = "Phone number cannot start with 0 or 1.";
  }

  const amount = parseCurrencyToNumber(advanceAmount);
  if (!advanceAmount.trim()) {
    errors.advanceAmount = "Please enter desired advance amount.";
  } else if (amount < 1000) {
    errors.advanceAmount = "Minimum advance amount is $1,000.";
  } else if (amount > 5000000) {
    errors.advanceAmount = "Maximum advance amount is $5,000,000.";
  }

  if (!consent) {
    errors.consent =
      "You must confirm that you have read the Terms and Conditions and Privacy Policy and the Underwriting Guidelines.";
  }

  const hasFieldErrors = Object.keys(errors).length > 0;
  if (hasFieldErrors) {
    return { valid: false, errors };
  }

  // Pre-approval business logic checks
  if (amount < 1000 || amount > 5000000) {
    return { valid: false, errors, declineReason: `We currently serve advance amounts between $1,000 and $5,000,000. The requested amount of ${formatCurrency(advanceAmount)} is outside that range.` };
  }

  return { valid: true, errors: {} };
}

type ApplicationWizardStep = 1 | 2 | 3 | 4 | 5;

const WIZARD_STEP_META: { step: ApplicationWizardStep; title: string; detail: string }[] = [
  { step: 1, title: "Business Information", detail: "EIN, business profile & deposits" },
  { step: 2, title: "Owner Information", detail: "Legal name, SSN, ownership %" },
  { step: 3, title: "Desired Advance Amount", detail: "Funding request" },
  { step: 4, title: "Contact Information", detail: "Business email & phone" },
  { step: 5, title: "Authorization", detail: "Review & submit" },
];

const WIZARD_STEP_KEYS: Record<ApplicationWizardStep, (keyof PreApprovalErrors)[]> = {
  1: ["ein", "businessLegalName", "businessBankAccount", "timeInBusiness", "monthlyDeposits"],
  2: ["ownerName", "ownerSSN", "ownershipPct"],
  3: ["advanceAmount"],
  4: ["email", "phone"],
  5: ["consent"],
};

function validateWizardStep(
  step: ApplicationWizardStep,
  ein: string,
  businessLegalName: string,
  businessBankAccount: string,
  timeInBusiness: string,
  monthlyDeposits: string,
  ownerName: string,
  ownerSSN: string,
  ownershipPct: string,
  email: string,
  phone: string,
  advanceAmount: string,
  consent: boolean
): PreApprovalErrors {
  const errors: PreApprovalErrors = {};

  if (step === 1) {
    const einDigits = ein.replace(/\D/g, "");
    if (einDigits.length !== 9) errors.ein = "EIN must be 9 digits.";
    if (einDigits.length === 9 && einDigits.startsWith("00")) errors.ein = "EIN cannot start with 00.";

    if (!businessLegalName.trim()) {
      errors.businessLegalName = "Business legal name is required.";
    } else if (businessLegalName.trim().length < 2) {
      errors.businessLegalName = "Please enter your full business legal name.";
    }

    if (!businessBankAccount) {
      errors.businessBankAccount = "Please indicate whether you have a business bank account.";
    } else if (!isAllowedBusinessBank(businessBankAccount)) {
      errors.businessBankAccount = "Please select a valid option.";
    }

    if (!timeInBusiness) {
      errors.timeInBusiness = "Please select how long you have been in business.";
    } else if (!isAllowedTib(timeInBusiness)) {
      errors.timeInBusiness = "Please select a valid time in business.";
    }

    if (!monthlyDeposits) {
      errors.monthlyDeposits = "Please select average monthly deposits.";
    } else if (!isAllowedMonthlyDeposits(monthlyDeposits)) {
      errors.monthlyDeposits = "Please select a valid deposit range.";
    }
    return errors;
  }

  if (step === 2) {
    if (!ownerName.trim()) {
      errors.ownerName = "Owner legal name is required.";
    } else if (ownerName.trim().split(/\s+/).length < 2) {
      errors.ownerName = "Please enter your full legal name (first and last).";
    }

    const ssnDigits = ownerSSN.replace(/\D/g, "");
    if (ssnDigits.length !== 9) errors.ownerSSN = "SSN must be 9 digits.";
    if (ssnDigits.length === 9) {
      if (
        ssnDigits.startsWith("9") ||
        ssnDigits.startsWith("000") ||
        ssnDigits.substring(3, 5) === "00" ||
        ssnDigits.substring(5) === "0000"
      ) {
        errors.ownerSSN = "Please enter a valid SSN.";
      }
    }

    if (!ownershipPct) errors.ownershipPct = "Please select ownership percentage.";
    return errors;
  }

  if (step === 3) {
    const amount = parseCurrencyToNumber(advanceAmount);
    if (!advanceAmount.trim()) {
      errors.advanceAmount = "Please enter desired advance amount.";
    } else if (amount < 1000) {
      errors.advanceAmount = "Minimum advance amount is $1,000.";
    } else if (amount > 5000000) {
      errors.advanceAmount = "Maximum advance amount is $5,000,000.";
    }
    return errors;
  }

  if (step === 4) {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Valid business email is required.";
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      errors.phone = "Phone must be 10 digits.";
    } else if (phoneDigits.startsWith("0") || phoneDigits.startsWith("1")) {
      errors.phone = "Phone number cannot start with 0 or 1.";
    }
    return errors;
  }

  if (step === 5) {
    if (!consent) {
      errors.consent =
        "You must confirm that you have read the Terms and Conditions and Privacy Policy and the Underwriting Guidelines.";
    }
    return errors;
  }

  return errors;
}

function mergeWizardStepErrors(
  prev: PreApprovalErrors,
  step: ApplicationWizardStep,
  stepErrors: PreApprovalErrors
): PreApprovalErrors {
  const next = { ...prev };
  for (const key of WIZARD_STEP_KEYS[step]) {
    if (stepErrors[key]) {
      (next as Record<string, string | undefined>)[key] = stepErrors[key];
    } else {
      delete next[key];
    }
  }
  return next;
}

// ── Main Application ──
export default function MCAApplication() {
  const [currentStep, setCurrentStep] = useState<AppStep>("application");
  const [declineReason, setDeclineReason] = useState("");

  // Step 1 fields
  const [ein, setEin] = useState("");
  const [businessLegalName, setBusinessLegalName] = useState("");
  const [businessBankAccount, setBusinessBankAccount] = useState("");
  const [timeInBusiness, setTimeInBusiness] = useState("");
  const [monthlyDeposits, setMonthlyDeposits] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerSSN, setOwnerSSN] = useState("");
  const [ownershipPct, setOwnershipPct] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [consent, setConsent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<PreApprovalErrors>({});
  const [applicationWizardStep, setApplicationWizardStep] = useState<ApplicationWizardStep>(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasTrackedStart = useRef(false);

  const handleFocus = useCallback(() => {
    if (!hasTrackedStart.current) {
      trackPrequalStart();
      hasTrackedStart.current = true;
    }
  }, []);

  useEffect(() => {
    if (currentStep === "application") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [applicationWizardStep, currentStep]);

  const submitApplication = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        ein: ein.replace(/\D/g, ""),
        businessLegalName: businessLegalName.trim(),
        businessBankAccount,
        timeInBusiness,
        monthlyDeposits,
        ownerName: ownerName.trim(),
        ownerSSN: ownerSSN.replace(/\D/g, ""),
        ownershipPercentage: ownershipPct,
        email: email.trim().toLowerCase(),
        phone: phone.replace(/\D/g, ""),
        advanceAmount,
        bankData: { method: "none" as const },
        consentGiven: true,
        consentTimestamp: new Date().toISOString(),
      };

      const response = await fetch("/api/questionnaire/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await parseFetchJson<{ error?: string }>(response);
      if (!response.ok) throw new Error(data.error || "Submission failed");

      trackCompletion({ advance_amount: advanceAmount });
      setCurrentStep("submitted");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(messageFromPossibleJsonHtmlError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const runApplicationSubmit = async () => {
    const result = validatePreApproval(
      ein,
      businessLegalName,
      businessBankAccount,
      timeInBusiness,
      monthlyDeposits,
      ownerName,
      ownerSSN,
      ownershipPct,
      email,
      phone,
      advanceAmount,
      consent
    );
    setFieldErrors(result.errors);

    if (!result.valid) {
      if (result.declineReason) {
        setDeclineReason(result.declineReason);
        setCurrentStep("declined");
        return;
      }
      const stepOrder: ApplicationWizardStep[] = [1, 2, 3, 4, 5];
      for (const st of stepOrder) {
        if (WIZARD_STEP_KEYS[st].some((k) => result.errors[k])) {
          setApplicationWizardStep(st);
          break;
        }
      }
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    await submitApplication();
  };

  const handleWizardNext = () => {
    const stepErrors = validateWizardStep(
      applicationWizardStep,
      ein,
      businessLegalName,
      businessBankAccount,
      timeInBusiness,
      monthlyDeposits,
      ownerName,
      ownerSSN,
      ownershipPct,
      email,
      phone,
      advanceAmount,
      consent
    );
    setFieldErrors((prev) => mergeWizardStepErrors(prev, applicationWizardStep, stepErrors));
    if (Object.keys(stepErrors).length > 0) return;

    if (applicationWizardStep < 5) {
      setApplicationWizardStep((s) => (s + 1) as ApplicationWizardStep);
    }
  };

  const handleWizardBack = () => {
    if (applicationWizardStep > 1) {
      setApplicationWizardStep((s) => (s - 1) as ApplicationWizardStep);
    }
  };

  const ownershipLabel =
    OWNERSHIP_OPTIONS.find((option) => option.value === ownershipPct)?.label || ownershipPct || "-";
  const maskedSsnForReview = ownerSSN
    ? `***-**-${ownerSSN.replace(/\D/g, "").slice(-4).padStart(4, "*")}`
    : "-";

  const handlePreApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (applicationWizardStep < 5) {
      handleWizardNext();
      return;
    }
    void runApplicationSubmit();
  };

  const AppHeader = () => (
    <header className="w-full pt-4 pl-4 md:pt-6 md:pl-6">
      <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
        <img src="/logo.svg" alt="Conduct Logo" className="w-40 md:w-48" />
      </Link>
    </header>
  );

  // ── DECLINED ──
  if (currentStep === "declined") {
    return (
      <main className="min-h-screen bg-white text-[#0B3D91]">
        <AppHeader />
        <section className="flex items-center justify-center py-12">
          <div className="text-center max-w-2xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-6">
            We Currently Cannot Proceed
          </h1>
          <div className="bg-[#FEF2F2] border-2 border-[#991B1B] rounded-lg p-8 mb-8">
            <p className="text-lg md:text-xl text-[#991B1B] leading-relaxed">
              {declineReason}
            </p>
          </div>
          <p className="text-[#2A3E66] text-lg mb-8 leading-relaxed">
            We currently do not have lenders that match your profile. If your situation changes, please feel free to reapply or reach out to our team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="inline-block bg-[#0B3D91] text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#0A2F72] transition-colors duration-200">
              Back to Home
            </Link>
            <Link href="/contact" className="inline-block border-2 border-[#0B3D91] text-[#0B3D91] px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#0B3D91] hover:text-white transition-colors duration-200">
              Talk to the Team
            </Link>
          </div>
        </div>
        </section>
      </main>
    );
  }

  // ── SUBMITTED (final) ──
  if (currentStep === "submitted") {
    return (
      <main className="min-h-screen bg-white text-[#0B3D91]">
        <AppHeader />
        <section className="flex items-center justify-center py-12">
          <div className="text-center max-w-2xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-6">
            Application submitted
          </h1>
          <div className="bg-[#F5F5F5] border-2 border-[#0B3D91] rounded-lg p-8 mb-8">
            <p className="text-lg md:text-xl text-[#2A3E66] leading-relaxed">
              Thank you. We have received your application and will get in touch with you shortly.
            </p>
          </div>
          <Link href="/" className="inline-block bg-[#0B3D91] text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#0A2F72] transition-colors duration-200">
            Back to Home
          </Link>
        </div>
        </section>
      </main>
    );
  }

  // ── Application form ──
  return (
    <main className="min-h-screen bg-white text-[#0B3D91]">
      <AppHeader />
      <section className="flex items-center justify-center py-12">
        <div className="w-full max-w-2xl mx-auto px-6">

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold mb-3">
            Apply for Business Cash Advance Funding
          </h1>
          <p className="text-[#2A3E66] text-lg leading-relaxed max-w-xl mx-auto">
            Complete the application below. It takes just a few minutes.
          </p>
        </div>

        <form onSubmit={handlePreApproval} className="space-y-8">
          <nav aria-label="Application progress" className="rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] p-4 md:p-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[#0B3D91]">
                Step {applicationWizardStep} of 5
              </p>
              <p className="text-sm text-[#6F6F6F]">
                {Math.round(((applicationWizardStep - 1) / 4) * 100)}% complete
              </p>
            </div>
            <div className="mb-4 h-2.5 w-full overflow-hidden rounded-full bg-[#E5E5E5]">
              <div
                className="h-full rounded-full bg-[#0B3D91] transition-all duration-300 ease-out"
                style={{ width: `${Math.round(((applicationWizardStep - 1) / 4) * 100)}%` }}
              />
            </div>
            <p className="mb-3 text-center text-base font-semibold text-[#0B3D91] md:text-lg">
              {WIZARD_STEP_META.find((m) => m.step === applicationWizardStep)?.title}
            </p>
            <ol className="flex justify-center gap-2" aria-hidden>
              {WIZARD_STEP_META.map(({ step }) => {
                const done = applicationWizardStep > step;
                const active = applicationWizardStep === step;
                return (
                  <li key={step}>
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold ${
                        done
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : active
                            ? "border-[#0B3D91] bg-[#0B3D91] text-white"
                            : "border-[#D1D5DB] bg-white text-[#9CA3AF]"
                      }`}
                    >
                      {done ? "✓" : step}
                    </span>
                  </li>
                );
              })}
            </ol>
            {applicationWizardStep >= 4 && (
              <p className="mt-4 text-center text-sm font-medium text-[#0B3D91]">Almost there — finish up below.</p>
            )}
          </nav>

          <div className="min-h-[12rem] space-y-6">
            {applicationWizardStep === 1 && (
              <section className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-lg font-medium">
                    Employer Identification Number (EIN) <span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm text-[#6F6F6F]">
                    We use your EIN to verify your business name, formation date, good standing, SIC code, and state.
                  </p>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={ein}
                    onChange={(e) => setEin(formatEIN(e.target.value))}
                    onFocus={handleFocus}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${fieldErrors.ein ? "border-red-500 focus:ring-red-500" : "border-[#0B3D91] focus:ring-[#0B3D91]"}`}
                    placeholder="XX-XXXXXXX"
                  />
                  {fieldErrors.ein && <p className="text-sm text-red-600">{fieldErrors.ein}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-lg font-medium">
                    Business legal name <span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm text-[#6F6F6F]">As registered with the IRS for this EIN.</p>
                  <input
                    type="text"
                    value={businessLegalName}
                    onChange={(e) => setBusinessLegalName(e.target.value)}
                    onFocus={handleFocus}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${fieldErrors.businessLegalName ? "border-red-500 focus:ring-red-500" : "border-[#0B3D91] focus:ring-[#0B3D91]"}`}
                    placeholder="e.g. ABC Holdings LLC"
                  />
                  {fieldErrors.businessLegalName && <p className="text-sm text-red-600">{fieldErrors.businessLegalName}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-lg font-medium">
                    Do you have a business bank account? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={businessBankAccount}
                    onChange={(e) => setBusinessBankAccount(e.target.value)}
                    onFocus={handleFocus}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-lg bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${fieldErrors.businessBankAccount ? "border-red-500 focus:ring-red-500" : "border-[#0B3D91] focus:ring-[#0B3D91]"}`}
                  >
                    <option value="">Select</option>
                    {HUBSPOT_BUSINESS_BANK_VALUES.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.businessBankAccount && <p className="text-sm text-red-600">{fieldErrors.businessBankAccount}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-lg font-medium">
                    How long have you been in business? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={timeInBusiness}
                    onChange={(e) => setTimeInBusiness(e.target.value)}
                    onFocus={handleFocus}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-lg bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${fieldErrors.timeInBusiness ? "border-red-500 focus:ring-red-500" : "border-[#0B3D91] focus:ring-[#0B3D91]"}`}
                  >
                    <option value="">Select</option>
                    {HUBSPOT_TIB_VALUES.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.timeInBusiness && <p className="text-sm text-red-600">{fieldErrors.timeInBusiness}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-lg font-medium">
                    Average monthly deposits (business account) <span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm text-[#6F6F6F]">Total deposits per month on average.</p>
                  <select
                    value={monthlyDeposits}
                    onChange={(e) => setMonthlyDeposits(e.target.value)}
                    onFocus={handleFocus}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-lg bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${fieldErrors.monthlyDeposits ? "border-red-500 focus:ring-red-500" : "border-[#0B3D91] focus:ring-[#0B3D91]"}`}
                  >
                    <option value="">Select</option>
                    {HUBSPOT_MONTHLY_DEPOSITS_VALUES.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.monthlyDeposits && <p className="text-sm text-red-600">{fieldErrors.monthlyDeposits}</p>}
                </div>
              </section>
            )}

            {applicationWizardStep === 2 && (
              <section className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-lg font-medium">Owner Full Legal Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    onFocus={handleFocus}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${fieldErrors.ownerName ? "border-red-500 focus:ring-red-500" : "border-[#0B3D91] focus:ring-[#0B3D91]"}`}
                    placeholder="As it appears on your ID"
                  />
                  {fieldErrors.ownerName && <p className="text-sm text-red-600">{fieldErrors.ownerName}</p>}
                </div>
                <div className="space-y-2">
                  <label className="block text-lg font-medium">Social Security Number <span className="text-red-500">*</span></label>
                  <p className="text-sm text-[#6F6F6F]">Used for a soft credit pull only. No impact to your score.</p>
                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    value={ownerSSN}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      if (raw.length <= 9) setOwnerSSN(formatSSN(e.target.value));
                    }}
                    onFocus={handleFocus}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-lg font-mono focus:outline-none focus:ring-2 focus:ring-offset-2 ${fieldErrors.ownerSSN ? "border-red-500 focus:ring-red-500" : "border-[#0B3D91] focus:ring-[#0B3D91]"}`}
                    placeholder={"\u2022\u2022\u2022-\u2022\u2022-\u2022\u2022\u2022\u2022"}
                  />
                  {fieldErrors.ownerSSN && <p className="text-sm text-red-600">{fieldErrors.ownerSSN}</p>}
                </div>
                <div className="space-y-2">
                  <label className="block text-lg font-medium">Ownership Percentage <span className="text-red-500">*</span></label>
                  <p className="text-sm text-[#6F6F6F]">The signing owner must typically hold 50% or more to personally guarantee.</p>
                  <select
                    value={ownershipPct}
                    onChange={(e) => setOwnershipPct(e.target.value)}
                    onFocus={handleFocus}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-lg bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${fieldErrors.ownershipPct ? "border-red-500 focus:ring-red-500" : "border-[#0B3D91] focus:ring-[#0B3D91]"}`}
                  >
                    <option value="">Select ownership</option>
                    {OWNERSHIP_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.ownershipPct && <p className="text-sm text-red-600">{fieldErrors.ownershipPct}</p>}
                </div>
              </section>
            )}

            {applicationWizardStep === 3 && (
              <section className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-lg font-medium">Desired Advance Amount <span className="text-red-500">*</span></label>
                  <p className="text-sm text-[#6F6F6F]">Enter an amount between $1,000 and $5,000,000.</p>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(formatCurrency(e.target.value))}
                    onFocus={handleFocus}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${fieldErrors.advanceAmount ? "border-red-500 focus:ring-red-500" : "border-[#0B3D91] focus:ring-[#0B3D91]"}`}
                    placeholder="$50,000"
                  />
                  {fieldErrors.advanceAmount && <p className="text-sm text-red-600">{fieldErrors.advanceAmount}</p>}
                </div>
              </section>
            )}

            {applicationWizardStep === 4 && (
              <section className="space-y-6">
                <h2 className="text-xl font-semibold border-b border-[#E5E5E5] pb-2">Contact Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-lg font-medium">Business Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={handleFocus}
                      className={`w-full px-4 py-3 border-2 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${fieldErrors.email ? "border-red-500 focus:ring-red-500" : "border-[#0B3D91] focus:ring-[#0B3D91]"}`}
                      placeholder="you@business.com"
                    />
                    {fieldErrors.email && <p className="text-sm text-red-600">{fieldErrors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-lg font-medium">Business Phone <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      onFocus={handleFocus}
                      className={`w-full px-4 py-3 border-2 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${fieldErrors.phone ? "border-red-500 focus:ring-red-500" : "border-[#0B3D91] focus:ring-[#0B3D91]"}`}
                      placeholder="(555) 123-4567"
                    />
                    {fieldErrors.phone && <p className="text-sm text-red-600">{fieldErrors.phone}</p>}
                  </div>
                </div>
              </section>
            )}

            {applicationWizardStep === 5 && (
              <section className="space-y-4">
                <div className="rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] p-4">
                  <p className="text-sm font-semibold text-[#0B3D91] mb-3">
                    Review your information before submitting
                  </p>
                  <div className="grid gap-2 text-sm text-[#2A3E66] md:grid-cols-2">
                    <p><span className="font-medium">EIN:</span> {ein || "-"}</p>
                    <p><span className="font-medium">Business name:</span> {businessLegalName || "-"}</p>
                    <p><span className="font-medium">Business bank account:</span> {businessBankAccount || "-"}</p>
                    <p><span className="font-medium">Time in business:</span> {timeInBusiness || "-"}</p>
                    <p><span className="font-medium">Avg. monthly deposits:</span> {monthlyDeposits || "-"}</p>
                    <p><span className="font-medium">Owner Name:</span> {ownerName || "-"}</p>
                    <p><span className="font-medium">SSN:</span> {maskedSsnForReview}</p>
                    <p><span className="font-medium">Ownership:</span> {ownershipLabel}</p>
                    <p><span className="font-medium">Advance Amount:</span> {advanceAmount || "-"}</p>
                    <p><span className="font-medium">Business Email:</span> {email || "-"}</p>
                    <p><span className="font-medium">Business Phone:</span> {phone || "-"}</p>
                  </div>
                </div>
                <div
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-colors ${
                    consent
                      ? "border-[#0B3D91] bg-[#F5F5F5]"
                      : fieldErrors.consent
                        ? "border-red-400 bg-red-50"
                        : "border-[#E5E5E5] bg-white"
                  }`}
                >
                  <input
                    id="consent-application"
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setConsent(checked);
                      if (checked) {
                        setFieldErrors((prev) => {
                          const next = { ...prev };
                          delete next.consent;
                          return next;
                        });
                      }
                    }}
                    className="mt-1 w-5 h-5 border-2 border-[#0B3D91] rounded focus:ring-2 focus:ring-[#0B3D91] text-[#0B3D91] cursor-pointer shrink-0"
                  />
                  <div className="text-sm text-[#2A3E66] leading-relaxed">
                    <label htmlFor="consent-application" className="cursor-pointer">
                      I confirm that I have read the Terms and Conditions and Privacy Policy and the Underwriting Guidelines.
                    </label>
                    <p className="mt-2 text-sm">
                      <Link href="/terms-privacy" className="text-[#0B3D91] underline font-medium hover:opacity-80">
                        Terms and Conditions and Privacy Policy
                      </Link>
                      {" · "}
                      <Link href="/underwriting-guidelines" className="text-[#0B3D91] underline font-medium hover:opacity-80">
                        Underwriting Guidelines
                      </Link>
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>

          {error && (
            <div className="p-4 bg-[#FEF2F2] border-2 border-[#991B1B] rounded-lg">
              <p className="text-[#991B1B]">{error}</p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {applicationWizardStep > 1 ? (
              <button
                type="button"
                onClick={handleWizardBack}
                className="w-full sm:w-auto rounded-lg border-2 border-[#0B3D91] px-8 py-3 text-lg font-medium text-[#0B3D91] transition-colors hover:bg-[#F5F5F5]"
              >
                Back
              </button>
            ) : (
              <span className="hidden sm:block sm:w-[140px]" aria-hidden />
            )}
            {applicationWizardStep < 5 ? (
              <button
                type="button"
                onClick={handleWizardNext}
                className="w-full rounded-lg bg-[#0B3D91] px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-[#0A2F72] sm:ml-auto sm:w-auto sm:min-w-[200px]"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full rounded-lg px-8 py-4 text-lg font-medium transition-colors sm:ml-auto sm:w-auto sm:min-w-[240px] ${
                  isSubmitting ? "cursor-not-allowed bg-[#E5E5E5] text-[#6F6F6F]" : "bg-[#0B3D91] text-white hover:bg-[#0A2F72]"
                }`}
              >
                {isSubmitting ? "Submitting…" : "Submit application"}
              </button>
            )}
          </div>

          <p className="text-center text-sm text-[#6F6F6F]">
            Your data is encrypted and transmitted securely. We never share your SSN with lenders.
          </p>
          <p className="text-center text-sm text-[#6F6F6F]">
            <Link href="/terms-privacy" className="underline hover:text-[#0B3D91]">
              Terms and Conditions and Privacy Policy
            </Link>
            {" · "}
            <Link href="/underwriting-guidelines" className="underline hover:text-[#0B3D91]">
              Underwriting Guidelines
            </Link>
            {" · "}
            <Link href="/blog" className="underline hover:text-[#0B3D91]">
              Blog
            </Link>
          </p>
        </form>
        </div>
      </section>
    </main>
  );
}
