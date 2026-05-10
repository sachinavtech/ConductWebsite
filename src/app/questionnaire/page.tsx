"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { trackPrequalStart, trackCompletion } from "@/lib/analytics";
import { messageFromPossibleJsonHtmlError, parseFetchJson } from "@/lib/parseFetchJson";

interface FileWithMeta {
  file: File;
  month: string;
  year: string;
}

interface PlaidAccount {
  id: string;
  name: string;
  institution: string;
  mask: string;
  type: string;
  monthsCovered: number;
}

type AppStep = "application" | "preapproved" | "declined" | "submitted";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 3 }, (_, i) => String(CURRENT_YEAR - i));

const OWNERSHIP_OPTIONS = [
  { value: "100", label: "100% (Sole owner)" },
  { value: "75-99", label: "75% to 99%" },
  { value: "51-74", label: "51% to 74%" },
  { value: "50", label: "50%" },
  { value: "25-49", label: "25% to 49%" },
  { value: "< 25", label: "Less than 25%" },
];

const DEMO_BANKS = [
  { name: "Chase", logo: "\u{1F3E6}" },
  { name: "Bank of America", logo: "\u{1F3DB}\uFE0F" },
  { name: "Wells Fargo", logo: "\u{1F3E6}" },
  { name: "Citibank", logo: "\u{1F3DB}\uFE0F" },
  { name: "US Bank", logo: "\u{1F3E6}" },
  { name: "PNC Bank", logo: "\u{1F3DB}\uFE0F" },
  { name: "Capital One", logo: "\u{1F3E6}" },
  { name: "TD Bank", logo: "\u{1F3DB}\uFE0F" },
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
  { step: 1, title: "Business Information", detail: "EIN" },
  { step: 2, title: "Owner Information", detail: "Legal name, SSN, ownership %" },
  { step: 3, title: "Desired Advance Amount", detail: "Funding request" },
  { step: 4, title: "Contact Information", detail: "Business email & phone" },
  { step: 5, title: "Authorization", detail: "Review & submit" },
];

const WIZARD_STEP_KEYS: Record<ApplicationWizardStep, (keyof PreApprovalErrors)[]> = {
  1: ["ein"],
  2: ["ownerName", "ownerSSN", "ownershipPct"],
  3: ["advanceAmount"],
  4: ["email", "phone"],
  5: ["consent"],
};

function validateWizardStep(
  step: ApplicationWizardStep,
  ein: string,
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

// ── Simulated Plaid Link Modal ──
function PlaidLinkModal({
  onSuccess,
  onClose,
}: {
  onSuccess: (accounts: PlaidAccount[]) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"select" | "credentials" | "connecting" | "accounts">("select");
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [bankSearch, setBankSearch] = useState("");

  const filteredBanks = DEMO_BANKS.filter(b =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  const handleBankSelect = (bankName: string) => {
    setSelectedBank(bankName);
    setStep("credentials");
  };

  const handleLogin = () => {
    setStep("connecting");
    setTimeout(() => setStep("accounts"), 2000);
  };

  const handleConfirm = () => {
    const mask = String(Math.floor(1000 + Math.random() * 9000));
    onSuccess([{
      id: `demo_${Date.now()}`,
      name: `Business Checking (...${mask})`,
      institution: selectedBank || "Demo Bank",
      mask,
      type: "checking",
      monthsCovered: 6,
    }]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-[#0B3D91] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <rect width="24" height="24" rx="4" fill="#00D064"/>
              <path d="M7 12h10M7 8h6M7 16h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="font-semibold">Plaid</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">&times;</button>
        </div>

        <div className="p-6">
          {step === "select" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">Select your bank</h3>
              <input
                type="text"
                value={bankSearch}
                onChange={(e) => setBankSearch(e.target.value)}
                placeholder="Search for your bank..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#00D064]"
                autoFocus
              />
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {filteredBanks.map(bank => (
                  <button key={bank.name} onClick={() => handleBankSelect(bank.name)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <span className="text-2xl">{bank.logo}</span>
                    <span className="font-medium">{bank.name}</span>
                  </button>
                ))}
                {filteredBanks.length === 0 && <p className="text-center text-gray-500 py-4">No banks found</p>}
              </div>
            </div>
          )}

          {step === "credentials" && (
            <div className="space-y-4">
              <button onClick={() => setStep("select")} className="text-sm text-gray-500 hover:text-gray-700">&larr; Back</button>
              <div className="text-center mb-2">
                <p className="text-2xl mb-1">{DEMO_BANKS.find(b => b.name === selectedBank)?.logo}</p>
                <h3 className="text-lg font-semibold">{selectedBank}</h3>
                <p className="text-sm text-gray-500">Demo mode. Any credentials will work.</p>
              </div>
              <input type="text" placeholder="Username" defaultValue="demo_user" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#00D064]" />
              <input type="password" placeholder="Password" defaultValue="demo_pass" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#00D064]" />
              <button onClick={handleLogin} className="w-full bg-[#00D064] text-white py-3 rounded-lg font-semibold hover:bg-[#00B856] transition-colors">Connect</button>
            </div>
          )}

          {step === "connecting" && (
            <div className="text-center py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-[#00D064] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-semibold text-lg">Connecting to {selectedBank}...</p>
              <p className="text-sm text-gray-500">Retrieving account information</p>
            </div>
          )}

          {step === "accounts" && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="#00D064" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h3 className="text-lg font-semibold">Account found</h3>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">{DEMO_BANKS.find(b => b.name === selectedBank)?.logo}</div>
                <div className="flex-1">
                  <p className="font-medium">{selectedBank} Business Checking</p>
                  <p className="text-sm text-gray-500">6 months of transaction history available</p>
                </div>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="#00D064" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <button onClick={handleConfirm} className="w-full bg-[#00D064] text-white py-3 rounded-lg font-semibold hover:bg-[#00B856] transition-colors">Continue</button>
              <p className="text-xs text-gray-400 text-center">Demo mode. No real bank data is accessed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Application ──
export default function MCAApplication() {
  const [currentStep, setCurrentStep] = useState<AppStep>("application");
  const [declineReason, setDeclineReason] = useState("");

  // Step 1 fields
  const [ein, setEin] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerSSN, setOwnerSSN] = useState("");
  const [ownershipPct, setOwnershipPct] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [consent, setConsent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<PreApprovalErrors>({});
  const [applicationWizardStep, setApplicationWizardStep] = useState<ApplicationWizardStep>(1);

  // Step 2 fields (bank info)
  const [bankMethod, setBankMethod] = useState<"plaid" | "upload">("plaid");
  const [plaidAccounts, setPlaidAccounts] = useState<PlaidAccount[]>([]);
  const [showPlaidModal, setShowPlaidModal] = useState(false);
  const [bankStatements, setBankStatements] = useState<FileWithMeta[]>([]);
  const [bankErrors, setBankErrors] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const runPreApprovalSubmit = () => {
    const result = validatePreApproval(ein, ownerName, ownerSSN, ownershipPct, email, phone, advanceAmount, consent);
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
    setCurrentStep("preapproved");
  };

  const handleWizardNext = () => {
    const stepErrors = validateWizardStep(
      applicationWizardStep,
      ein,
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

  // ── Step 1: Pre-approval submit ──
  const handlePreApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (applicationWizardStep < 5) {
      handleWizardNext();
      return;
    }
    runPreApprovalSubmit();
  };

  // ── Step 2: Bank info + final submit ──
  const handlePlaidSuccess = (accounts: PlaidAccount[]) => {
    setPlaidAccounts(accounts);
    setShowPlaidModal(false);
    setError(null);
  };

  const removePlaidAccount = (id: string) => {
    setPlaidAccounts(prev => prev.filter(a => a.id !== id));
  };

  const handleFileAdd = (files: FileList | null) => {
    if (!files) return;
    const newFiles: FileWithMeta[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type !== "application/pdf") { setError("Only PDF files are accepted."); continue; }
      if (file.size > 20 * 1024 * 1024) { setError("Each file must be under 20MB."); continue; }
      newFiles.push({ file, month: "", year: "" });
    }
    setBankStatements(prev => {
      const combined = [...prev, ...newFiles];
      if (combined.length > 6) { setError("Maximum 6 files allowed."); return prev; }
      setError(null);
      return combined;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateStatementMeta = (index: number, field: "month" | "year", value: string) => {
    setBankStatements(prev => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const removeStatement = (index: number) => {
    setBankStatements(prev => prev.filter((_, i) => i !== index));
  };

  const validateBankInfo = (): boolean => {
    if (bankMethod === "plaid") {
      if (plaidAccounts.length === 0) { setBankErrors("Please link your bank account via Plaid."); return false; }
    } else {
      if (bankStatements.length < 3) { setBankErrors("Please upload at least 3 bank statements."); return false; }
      if (bankStatements.some(s => !s.month || !s.year)) { setBankErrors("Please select the month and year for each statement."); return false; }
      const periods = bankStatements.filter(s => s.month && s.year).map(s => `${s.year}-${s.month}`);
      if (new Set(periods).size < periods.length) { setBankErrors("Each statement must be for a different month."); return false; }
    }
    setBankErrors(null);
    return true;
  };

  const handleFinalSubmit = async () => {
    if (!validateBankInfo()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const bankData = bankMethod === "plaid"
        ? { method: "plaid" as const, plaidAccounts: plaidAccounts.map(a => ({ id: a.id, name: a.name, institution: a.institution, mask: a.mask, type: a.type, monthsCovered: a.monthsCovered })) }
        : { method: "upload" as const, bankStatements: bankStatements.map(s => ({ fileName: s.file.name, month: s.month, year: s.year, sizeKB: Math.round(s.file.size / 1024) })) };

      const payload = {
        ein: ein.replace(/\D/g, ""),
        ownerName: ownerName.trim(),
        ownerSSN: ownerSSN.replace(/\D/g, ""),
        ownershipPercentage: ownershipPct,
        email: email.trim().toLowerCase(),
        phone: phone.replace(/\D/g, ""),
        advanceAmount,
        bankData,
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
            Application Received
          </h1>
          <div className="bg-[#F5F5F5] border-2 border-[#0B3D91] rounded-lg p-8 mb-8">
            <p className="text-lg md:text-xl text-[#2A3E66] mb-4 leading-relaxed">
              We are running your business verification, soft credit pull, and bank {bankMethod === "plaid" ? "account" : "statement"} analysis now.
            </p>
            <p className="text-lg md:text-xl text-[#2A3E66] leading-relaxed">
              You could be matched instantly and receive funding within <span className="font-semibold text-[#0B3D91]">24 to 48 hours</span>.
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

  // ── PRE-APPROVED: collect bank info ──
  if (currentStep === "preapproved") {
    return (
      <main className="min-h-screen bg-white text-[#0B3D91]">
        <AppHeader />
        <section className="flex items-center justify-center py-12">
          <div className="w-full max-w-2xl mx-auto px-6">

          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold mb-3">
              Congratulations, You Are Pre-Approved!
            </h1>
            <p className="text-[#2A3E66] text-lg leading-relaxed max-w-xl mx-auto">
              Your business information passed our initial review. To complete your application, please provide your bank information below.
            </p>
          </div>

          <div className="space-y-8">
            {/* Bank Info Toggle */}
            <section className="space-y-6">
              <h2 className="text-xl font-semibold border-b border-[#E5E5E5] pb-2">Bank Information</h2>

              <div className="flex rounded-lg border-2 border-[#0B3D91] overflow-hidden">
                <button type="button" onClick={() => setBankMethod("plaid")} className={`flex-1 py-3 text-center font-medium transition-colors ${bankMethod === "plaid" ? "bg-[#0B3D91] text-white" : "bg-white text-[#2A3E66] hover:bg-[#F5F5F5]"}`}>
                  Link via Plaid
                </button>
                <button type="button" onClick={() => setBankMethod("upload")} className={`flex-1 py-3 text-center font-medium transition-colors ${bankMethod === "upload" ? "bg-[#0B3D91] text-white" : "bg-white text-[#2A3E66] hover:bg-[#F5F5F5]"}`}>
                  Upload Statements
                </button>
              </div>

              {bankMethod === "plaid" ? (
                <div className="space-y-4">
                  <p className="text-sm text-[#6F6F6F]">
                    Securely connect your business bank account. Plaid reads your transaction history to extract deposits, overdrafts, NSFs, and 20+ underwriting metrics instantly.
                  </p>
                  {plaidAccounts.length > 0 ? (
                    <div className="space-y-3">
                      {plaidAccounts.map(acct => (
                        <div key={acct.id} className="flex items-center gap-3 bg-green-50 border-2 border-green-200 rounded-lg p-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-green-900">{acct.name}</p>
                            <p className="text-sm text-green-700">{acct.institution} &middot; {acct.monthsCovered} months of history</p>
                          </div>
                          <button type="button" onClick={() => removePlaidAccount(acct.id)} className="text-red-600 hover:text-red-800 text-sm font-medium px-2 shrink-0">Remove</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setShowPlaidModal(true)} className="text-sm text-[#2A3E66] hover:text-[#0B3D91] font-medium">+ Link another account</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setShowPlaidModal(true)} className={`w-full py-4 rounded-lg border-2 border-dashed font-medium text-lg transition-colors ${bankErrors ? "border-red-400 bg-red-50 text-red-700" : "border-[#CCC] text-[#2A3E66] hover:border-[#0B3D91] hover:bg-[#FAFAFA]"}`}>
                      <span className="flex items-center justify-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#00D064"/><path d="M7 12h10M7 8h6M7 16h8" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                        Connect with Plaid
                      </span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-[#6F6F6F]">
                    Upload your last 3 months of business bank statements (PDF). Our system automatically extracts deposits, overdrafts, NSFs, average balances, and 20+ underwriting metrics.
                  </p>
                  {bankStatements.length > 0 && (
                    <div className="space-y-3">
                      {bankStatements.map((stmt, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-[#F5F5F5] rounded-lg p-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{stmt.file.name}</p>
                            <p className="text-xs text-[#6F6F6F]">{Math.round(stmt.file.size / 1024)} KB</p>
                          </div>
                          <div className="flex gap-2 items-center">
                            <select value={stmt.month} onChange={(e) => updateStatementMeta(idx, "month", e.target.value)} className="px-2 py-1.5 border border-[#CCC] rounded text-sm bg-white">
                              <option value="">Month</option>
                              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <select value={stmt.year} onChange={(e) => updateStatementMeta(idx, "year", e.target.value)} className="px-2 py-1.5 border border-[#CCC] rounded text-sm bg-white">
                              <option value="">Year</option>
                              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <button type="button" onClick={() => removeStatement(idx)} className="text-red-600 hover:text-red-800 text-sm font-medium px-2">Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {bankStatements.length < 6 && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleFileAdd(e.dataTransfer.files); }}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-150 ${bankErrors ? 'border-red-400 bg-red-50' : 'border-[#CCC] hover:border-[#0B3D91] hover:bg-[#FAFAFA]'}`}
                    >
                      <input ref={fileInputRef} type="file" accept=".pdf" multiple onChange={(e) => handleFileAdd(e.target.files)} className="hidden" />
                      <p className="text-lg font-medium text-[#2A3E66] mb-1">Drop PDF files here or click to browse</p>
                      <p className="text-sm text-[#6F6F6F]">{bankStatements.length}/3 minimum &middot; PDF only &middot; 20MB max per file</p>
                    </div>
                  )}
                </div>
              )}
              {bankErrors && <p className="text-sm text-red-600">{bankErrors}</p>}
            </section>

            {error && (
              <div className="p-4 bg-[#FEF2F2] border-2 border-[#991B1B] rounded-lg">
                <p className="text-[#991B1B]">{error}</p>
              </div>
            )}

            <button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className={`w-full px-8 py-4 rounded-lg text-lg font-medium transition-colors duration-200 ${isSubmitting ? "bg-[#E5E5E5] text-[#6F6F6F] cursor-not-allowed" : "bg-[#0B3D91] text-white hover:bg-[#0A2F72]"}`}
            >
              {isSubmitting ? "Submitting..." : "Complete Application"}
            </button>

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
            </p>
          </div>

          {showPlaidModal && <PlaidLinkModal onSuccess={handlePlaidSuccess} onClose={() => setShowPlaidModal(false)} />}
        </div>
        </section>
      </main>
    );
  }

  // ── STEP 1: Pre-approval Application Form ──
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
            Fill out the form below to see if you pre-qualify. No credit impact. Takes under 2 minutes.
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
                    <p><span className="font-medium">Owner Name:</span> {ownerName || "-"}</p>
                    <p><span className="font-medium">SSN:</span> {maskedSsnForReview}</p>
                    <p><span className="font-medium">Ownership:</span> {ownershipLabel}</p>
                    <p><span className="font-medium">Advance Amount:</span> {advanceAmount || "-"}</p>
                    <p><span className="font-medium">Business Email:</span> {email || "-"}</p>
                    <p><span className="font-medium">Business Phone:</span> {phone || "-"}</p>
                  </div>
                </div>
                <div
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-colors ${consent ? "border-[#0B3D91] bg-[#F5F5F5]" : fieldErrors.consent ? "border-red-400" : "border-[#E5E5E5]"}`}
                >
                  <input
                    id="consent-preapproval"
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 w-5 h-5 border-2 border-[#0B3D91] rounded focus:ring-2 focus:ring-[#0B3D91] text-[#0B3D91] cursor-pointer shrink-0"
                  />
                  <div className="text-sm text-[#2A3E66] leading-relaxed">
                    <label htmlFor="consent-preapproval" className="cursor-pointer">
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
                {fieldErrors.consent && <p className="text-sm text-red-600">{fieldErrors.consent}</p>}
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
                className="w-full rounded-lg bg-[#0B3D91] px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-[#0A2F72] sm:ml-auto sm:w-auto sm:min-w-[240px]"
              >
                Check Pre-Approval
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
          </p>
        </form>
        </div>
      </section>
    </main>
  );
}
