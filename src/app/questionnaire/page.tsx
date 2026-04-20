"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { trackPrequalStart, trackCompletion } from "@/lib/analytics";

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

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 3 }, (_, i) => String(CURRENT_YEAR - i));

const ADVANCE_OPTIONS = [
  { value: "< $25k", label: "Under $25,000" },
  { value: "$25k-$50k", label: "$25,000 - $50,000" },
  { value: "$50k-$100k", label: "$50,000 - $100,000" },
  { value: "$100k-$250k", label: "$100,000 - $250,000" },
  { value: "$250k-$500k", label: "$250,000 - $500,000" },
  { value: "$500k+", label: "$500,000+" },
];

const OWNERSHIP_OPTIONS = [
  { value: "100", label: "100% (Sole owner)" },
  { value: "75-99", label: "75% - 99%" },
  { value: "51-74", label: "51% - 74%" },
  { value: "50", label: "50%" },
  { value: "25-49", label: "25% - 49%" },
  { value: "< 25", label: "Less than 25%" },
];

const DEMO_BANKS = [
  { name: "Chase", logo: "🏦" },
  { name: "Bank of America", logo: "🏛️" },
  { name: "Wells Fargo", logo: "🏦" },
  { name: "Citibank", logo: "🏛️" },
  { name: "US Bank", logo: "🏦" },
  { name: "PNC Bank", logo: "🏛️" },
  { name: "Capital One", logo: "🏦" },
  { name: "TD Bank", logo: "🏛️" },
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

// ── Simulated Plaid Link Modal ──────────────────────────────────
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
    onSuccess([
      {
        id: `demo_${Date.now()}`,
        name: `Business Checking (...${mask})`,
        institution: selectedBank || "Demo Bank",
        mask,
        type: "checking",
        monthsCovered: 6,
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-[#1A1A1A] text-white px-6 py-4 flex items-center justify-between">
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
                  <button
                    key={bank.name}
                    onClick={() => handleBankSelect(bank.name)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className="text-2xl">{bank.logo}</span>
                    <span className="font-medium">{bank.name}</span>
                  </button>
                ))}
                {filteredBanks.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No banks found</p>
                )}
              </div>
            </div>
          )}

          {step === "credentials" && (
            <div className="space-y-4">
              <button onClick={() => setStep("select")} className="text-sm text-gray-500 hover:text-gray-700">&larr; Back</button>
              <div className="text-center mb-2">
                <p className="text-2xl mb-1">{DEMO_BANKS.find(b => b.name === selectedBank)?.logo}</p>
                <h3 className="text-lg font-semibold">{selectedBank}</h3>
                <p className="text-sm text-gray-500">Demo mode — any credentials will work</p>
              </div>
              <input
                type="text"
                placeholder="Username"
                defaultValue="demo_user"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#00D064]"
              />
              <input
                type="password"
                placeholder="Password"
                defaultValue="demo_pass"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#00D064]"
              />
              <button
                onClick={handleLogin}
                className="w-full bg-[#00D064] text-white py-3 rounded-lg font-semibold hover:bg-[#00B856] transition-colors"
              >
                Connect
              </button>
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
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                  {DEMO_BANKS.find(b => b.name === selectedBank)?.logo}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{selectedBank} Business Checking</p>
                  <p className="text-sm text-gray-500">6 months of transaction history available</p>
                </div>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="#00D064" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>

              <button
                onClick={handleConfirm}
                className="w-full bg-[#00D064] text-white py-3 rounded-lg font-semibold hover:bg-[#00B856] transition-colors"
              >
                Continue
              </button>
              <p className="text-xs text-gray-400 text-center">
                Demo mode — no real bank data is accessed
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Application ────────────────────────────────────────────
export default function MCAApplication() {
  const [ein, setEin] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerSSN, setOwnerSSN] = useState("");
  const [ownershipPct, setOwnershipPct] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");

  // Bank data — either Plaid or upload
  const [bankMethod, setBankMethod] = useState<"plaid" | "upload">("plaid");
  const [plaidAccounts, setPlaidAccounts] = useState<PlaidAccount[]>([]);
  const [showPlaidModal, setShowPlaidModal] = useState(false);
  const [bankStatements, setBankStatements] = useState<FileWithMeta[]>([]);

  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasTrackedStart = useRef(false);

  const handleFocus = useCallback(() => {
    if (!hasTrackedStart.current) {
      trackPrequalStart();
      hasTrackedStart.current = true;
    }
  }, []);

  const bankDataProvided = bankMethod === "plaid"
    ? plaidAccounts.length > 0
    : bankStatements.length >= 3;

  // ── Plaid handlers ──
  const handlePlaidSuccess = (accounts: PlaidAccount[]) => {
    setPlaidAccounts(accounts);
    setShowPlaidModal(false);
    setError(null);
  };

  const removePlaidAccount = (id: string) => {
    setPlaidAccounts(prev => prev.filter(a => a.id !== id));
  };

  // ── File upload handlers ──
  const handleFileAdd = (files: FileList | null) => {
    if (!files) return;

    const newFiles: FileWithMeta[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type !== "application/pdf") {
        setError("Only PDF files are accepted for bank statements.");
        continue;
      }
      if (file.size > 20 * 1024 * 1024) {
        setError("Each file must be under 20MB.");
        continue;
      }
      newFiles.push({ file, month: "", year: "" });
    }

    setBankStatements(prev => {
      const combined = [...prev, ...newFiles];
      if (combined.length > 6) {
        setError("Maximum 6 bank statement files allowed.");
        return prev;
      }
      setError(null);
      return combined;
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateStatementMeta = (index: number, field: "month" | "year", value: string) => {
    setBankStatements(prev =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const removeStatement = (index: number) => {
    setBankStatements(prev => prev.filter((_, i) => i !== index));
  };

  // ── Validation ──
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    const einDigits = ein.replace(/\D/g, "");
    if (einDigits.length !== 9) errors.ein = "EIN must be 9 digits (XX-XXXXXXX).";

    if (!ownerName.trim()) errors.ownerName = "Owner legal name is required.";

    const ssnDigits = ownerSSN.replace(/\D/g, "");
    if (ssnDigits.length !== 9) errors.ownerSSN = "SSN must be 9 digits.";

    if (!ownershipPct) errors.ownershipPct = "Please select ownership percentage.";

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Valid business email is required.";

    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) errors.phone = "Phone must be 10 digits.";

    if (!advanceAmount) errors.advanceAmount = "Please select desired advance amount.";

    if (bankMethod === "plaid") {
      if (plaidAccounts.length === 0)
        errors.bankData = "Please link your bank account via Plaid.";
    } else {
      if (bankStatements.length < 3)
        errors.bankData = "Please upload at least 3 bank statements.";

      const incompleteStatements = bankStatements.some(s => !s.month || !s.year);
      if (bankStatements.length >= 3 && incompleteStatements)
        errors.bankData = "Please select the month and year for each statement.";

      const statementPeriods = bankStatements
        .filter(s => s.month && s.year)
        .map(s => `${s.year}-${s.month}`);
      const uniquePeriods = new Set(statementPeriods);
      if (statementPeriods.length > 0 && uniquePeriods.size < statementPeriods.length)
        errors.bankData = "Each statement must be for a different month.";
    }

    if (!consent)
      errors.consent = "You must authorize the soft credit pull and data sharing to proceed.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const bankData = bankMethod === "plaid"
        ? {
            method: "plaid" as const,
            plaidAccounts: plaidAccounts.map(a => ({
              id: a.id,
              name: a.name,
              institution: a.institution,
              mask: a.mask,
              type: a.type,
              monthsCovered: a.monthsCovered,
            })),
          }
        : {
            method: "upload" as const,
            bankStatements: bankStatements.map(s => ({
              fileName: s.file.name,
              month: s.month,
              year: s.year,
              sizeKB: Math.round(s.file.size / 1024),
            })),
          };

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

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Submission failed");

      trackCompletion({ advance_amount: advanceAmount });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success Screen ──
  if (submitted) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-white text-[#1A1A1A] py-12">
        <div className="text-center max-w-2xl mx-auto px-6">
          <div className="mb-8">
            <Link href="/">
              <img src="/logo.svg" alt="Conduct Logo" className="w-32 md:w-40 mx-auto mb-8 cursor-pointer hover:opacity-80 transition-opacity" />
            </Link>
          </div>

          <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-6">
            Application Received
          </h1>

          <div className="bg-[#F5F5F5] border-2 border-[#1A1A1A] rounded-lg p-8 mb-8">
            <p className="text-lg md:text-xl text-[#4A4A4A] mb-4 leading-relaxed">
              We&apos;re running your business verification, soft credit pull, and bank {bankMethod === "plaid" ? "account" : "statement"} analysis now.
            </p>
            <p className="text-lg md:text-xl text-[#4A4A4A] leading-relaxed">
              You&apos;ll hear from us within <span className="font-semibold text-[#1A1A1A]">1 business day</span> with your MCA pre-qualification results and matched lender options.
            </p>
          </div>

          <div className="text-left bg-white border border-[#E5E5E5] rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-lg mb-3">What happens next:</h3>
            <ol className="space-y-2 text-[#4A4A4A]">
              <li className="flex gap-3">
                <span className="font-semibold text-[#1A1A1A] shrink-0">1.</span>
                <span>Middesk verifies your business entity via EIN</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-[#1A1A1A] shrink-0">2.</span>
                <span>Soft credit pull (no impact to your score)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-[#1A1A1A] shrink-0">3.</span>
                <span>
                  {bankMethod === "plaid"
                    ? "Plaid analyzes your linked account for deposit patterns, overdrafts, and cash flow metrics"
                    : "Bank statement analysis extracts deposit patterns, overdrafts, and cash flow metrics"}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-[#1A1A1A] shrink-0">4.</span>
                <span>We match you with lenders that fit your profile and advance size</span>
              </li>
            </ol>
          </div>

          <Link
            href="/"
            className="inline-block bg-[#1A1A1A] text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#333333] transition-colors duration-200"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  // ── Application Form ──
  return (
    <main className="flex items-center justify-center min-h-screen bg-white text-[#1A1A1A] py-12">
      <div className="w-full max-w-2xl mx-auto px-6">
        <div className="mb-8">
          <Link href="/">
            <img src="/logo.svg" alt="Conduct Logo" className="w-32 md:w-40 mx-auto mb-8 cursor-pointer hover:opacity-80 transition-opacity" />
          </Link>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold mb-3">
            Apply for MCA Funding
          </h1>
          <p className="text-[#4A4A4A] text-lg leading-relaxed max-w-xl mx-auto">
            8 fields. No credit impact. We pull the rest automatically.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* ── Business ── */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-[#E5E5E5] pb-2">Business</h2>
            <div className="space-y-2">
              <label className="block text-lg font-medium">
                Employer Identification Number (EIN) <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-[#6F6F6F]">
                We use your EIN to verify your business name, formation date, good standing, SIC code, and state via Middesk.
              </p>
              <input
                type="text"
                inputMode="numeric"
                value={ein}
                onChange={(e) => setEin(formatEIN(e.target.value))}
                onFocus={handleFocus}
                className={`w-full px-4 py-3 border-2 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${fieldErrors.ein ? 'border-red-500 focus:ring-red-500' : 'border-[#1A1A1A] focus:ring-[#1A1A1A]'}`}
                placeholder="XX-XXXXXXX"
              />
              {fieldErrors.ein && <p className="text-sm text-red-600">{fieldErrors.ein}</p>}
            </div>
          </section>

          {/* ── Owner ── */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-[#E5E5E5] pb-2">Owner</h2>
            <div className="space-y-2">
              <label className="block text-lg font-medium">
                Owner Full Legal Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                onFocus={handleFocus}
                className={`w-full px-4 py-3 border-2 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${fieldErrors.ownerName ? 'border-red-500 focus:ring-red-500' : 'border-[#1A1A1A] focus:ring-[#1A1A1A]'}`}
                placeholder="As it appears on your ID"
              />
              {fieldErrors.ownerName && <p className="text-sm text-red-600">{fieldErrors.ownerName}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-medium">
                Social Security Number <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-[#6F6F6F]">
                Used for a soft credit pull only — no impact to your score. Also verifies identity and OFAC/sanctions status.
              </p>
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
                className={`w-full px-4 py-3 border-2 rounded-lg text-lg font-mono focus:outline-none focus:ring-2 focus:ring-offset-2 ${fieldErrors.ownerSSN ? 'border-red-500 focus:ring-red-500' : 'border-[#1A1A1A] focus:ring-[#1A1A1A]'}`}
                placeholder={"\u2022\u2022\u2022-\u2022\u2022-\u2022\u2022\u2022\u2022"}
              />
              {fieldErrors.ownerSSN && <p className="text-sm text-red-600">{fieldErrors.ownerSSN}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-medium">
                Ownership Percentage <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-[#6F6F6F]">
                The signing owner must typically hold 50%+ to personally guarantee. Below 50% may require additional guarantors.
              </p>
              <select
                value={ownershipPct}
                onChange={(e) => setOwnershipPct(e.target.value)}
                onFocus={handleFocus}
                className={`w-full px-4 py-3 border-2 rounded-lg text-lg bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${fieldErrors.ownershipPct ? 'border-red-500 focus:ring-red-500' : 'border-[#1A1A1A] focus:ring-[#1A1A1A]'}`}
              >
                <option value="">Select ownership</option>
                {OWNERSHIP_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {fieldErrors.ownershipPct && <p className="text-sm text-red-600">{fieldErrors.ownershipPct}</p>}
            </div>
          </section>

          {/* ── Contact ── */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-[#E5E5E5] pb-2">Contact</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-lg font-medium">
                  Business Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={handleFocus}
                  className={`w-full px-4 py-3 border-2 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-[#1A1A1A] focus:ring-[#1A1A1A]'}`}
                  placeholder="you@business.com"
                />
                {fieldErrors.email && <p className="text-sm text-red-600">{fieldErrors.email}</p>}
              </div>
              <div className="space-y-2">
                <label className="block text-lg font-medium">
                  Business Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  onFocus={handleFocus}
                  className={`w-full px-4 py-3 border-2 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${fieldErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-[#1A1A1A] focus:ring-[#1A1A1A]'}`}
                  placeholder="(555) 123-4567"
                />
                {fieldErrors.phone && <p className="text-sm text-red-600">{fieldErrors.phone}</p>}
              </div>
            </div>
          </section>

          {/* ── Funding ── */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-[#E5E5E5] pb-2">Funding</h2>
            <div className="space-y-2">
              <label className="block text-lg font-medium">
                Desired Advance Amount <span className="text-red-500">*</span>
              </label>
              <select
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(e.target.value)}
                onFocus={handleFocus}
                className={`w-full px-4 py-3 border-2 rounded-lg text-lg bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${fieldErrors.advanceAmount ? 'border-red-500 focus:ring-red-500' : 'border-[#1A1A1A] focus:ring-[#1A1A1A]'}`}
              >
                <option value="">Select amount range</option>
                {ADVANCE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {fieldErrors.advanceAmount && <p className="text-sm text-red-600">{fieldErrors.advanceAmount}</p>}
            </div>
          </section>

          {/* ── Bank Data (Plaid or Upload) ── */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-[#E5E5E5] pb-2">Bank Information <span className="text-red-500">*</span></h2>

            {/* Toggle */}
            <div className="flex rounded-lg border-2 border-[#1A1A1A] overflow-hidden">
              <button
                type="button"
                onClick={() => setBankMethod("plaid")}
                className={`flex-1 py-3 text-center font-medium transition-colors ${
                  bankMethod === "plaid"
                    ? "bg-[#1A1A1A] text-white"
                    : "bg-white text-[#4A4A4A] hover:bg-[#F5F5F5]"
                }`}
              >
                Link via Plaid
              </button>
              <button
                type="button"
                onClick={() => setBankMethod("upload")}
                className={`flex-1 py-3 text-center font-medium transition-colors ${
                  bankMethod === "upload"
                    ? "bg-[#1A1A1A] text-white"
                    : "bg-white text-[#4A4A4A] hover:bg-[#F5F5F5]"
                }`}
              >
                Upload Statements
              </button>
            </div>

            {bankMethod === "plaid" ? (
              <div className="space-y-4">
                <p className="text-sm text-[#6F6F6F]">
                  Securely connect your business bank account. Plaid reads your transaction history to extract deposits, overdrafts, NSFs, and 20+ underwriting metrics — instantly.
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
                        <button
                          type="button"
                          onClick={() => removePlaidAccount(acct.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium px-2 shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setShowPlaidModal(true)}
                      className="text-sm text-[#4A4A4A] hover:text-[#1A1A1A] font-medium"
                    >
                      + Link another account
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPlaidModal(true)}
                    className={`w-full py-4 rounded-lg border-2 border-dashed font-medium text-lg transition-colors ${
                      fieldErrors.bankData
                        ? "border-red-400 bg-red-50 text-red-700 hover:border-red-500"
                        : "border-[#CCC] text-[#4A4A4A] hover:border-[#1A1A1A] hover:bg-[#FAFAFA]"
                    }`}
                  >
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
                          <select
                            value={stmt.month}
                            onChange={(e) => updateStatementMeta(idx, "month", e.target.value)}
                            className="px-2 py-1.5 border border-[#CCC] rounded text-sm bg-white"
                          >
                            <option value="">Month</option>
                            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                          <select
                            value={stmt.year}
                            onChange={(e) => updateStatementMeta(idx, "year", e.target.value)}
                            className="px-2 py-1.5 border border-[#CCC] rounded text-sm bg-white"
                          >
                            <option value="">Year</option>
                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                          <button
                            type="button"
                            onClick={() => removeStatement(idx)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium px-2"
                          >
                            Remove
                          </button>
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
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-150 ${
                      fieldErrors.bankData ? 'border-red-400 bg-red-50 hover:border-red-500' : 'border-[#CCC] hover:border-[#1A1A1A] hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      multiple
                      onChange={(e) => handleFileAdd(e.target.files)}
                      className="hidden"
                    />
                    <p className="text-lg font-medium text-[#4A4A4A] mb-1">
                      Drop PDF files here or click to browse
                    </p>
                    <p className="text-sm text-[#6F6F6F]">
                      {bankStatements.length}/3 minimum &middot; PDF only &middot; 20MB max per file
                    </p>
                  </div>
                )}
              </div>
            )}
            {fieldErrors.bankData && <p className="text-sm text-red-600">{fieldErrors.bankData}</p>}
          </section>

          {/* ── Authorization ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold border-b border-[#E5E5E5] pb-2">Authorization</h2>
            <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              consent ? 'border-[#1A1A1A] bg-[#F5F5F5]' : fieldErrors.consent ? 'border-red-400' : 'border-[#E5E5E5] hover:border-[#999]'
            }`}>
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-5 h-5 border-2 border-[#1A1A1A] rounded focus:ring-2 focus:ring-[#1A1A1A] text-[#1A1A1A] cursor-pointer shrink-0"
              />
              <span className="text-sm text-[#4A4A4A] leading-relaxed">
                I authorize Conduct Finance to perform a <strong>soft credit inquiry</strong> (no impact to my credit score), verify my identity, {bankMethod === "plaid" ? "access my bank account data via Plaid, " : ""}share my application data with potential MCA lenders for the purpose of providing funding offers, and confirm that I have the authority to sign on behalf of the business as an owner with the percentage stated above. I understand a hard credit pull will only occur at the time of funding, with my separate consent.
              </span>
            </label>
            {fieldErrors.consent && <p className="text-sm text-red-600">{fieldErrors.consent}</p>}
          </section>

          {error && (
            <div className="p-4 bg-[#FEF2F2] border-2 border-[#991B1B] rounded-lg">
              <p className="text-[#991B1B]">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full px-8 py-4 rounded-lg text-lg font-medium transition-colors duration-200 ${
              isSubmitting
                ? "bg-[#E5E5E5] text-[#6F6F6F] cursor-not-allowed"
                : "bg-[#1A1A1A] text-white hover:bg-[#333333]"
            }`}
          >
            {isSubmitting ? "Submitting Application..." : "Submit Application"}
          </button>

          <p className="text-center text-sm text-[#6F6F6F]">
            Your data is encrypted and transmitted securely. We never share your SSN with lenders.
          </p>
        </form>

        {showPlaidModal && (
          <PlaidLinkModal
            onSuccess={handlePlaidSuccess}
            onClose={() => setShowPlaidModal(false)}
          />
        )}
      </div>
    </main>
  );
}
