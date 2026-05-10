"use client";

import { useState } from "react";
import Link from "next/link";
import { messageFromPossibleJsonHtmlError, parseFetchJson } from "@/lib/parseFetchJson";

const CREDIBLY_URL = "https://www.credibly.com/conduct-finance/";

/**
 * Credibly’s page uses an embedded HubSpot form. HubSpot can prefill fields from the
 * landing-page URL query string when enabled on their form (“Pre-populate fields from query parameters”).
 * We pass firstname, lastname, email, company only — not phone: the embedded phone field
 * (country dropdown + national digits) does not reliably accept query-string prefill.
 * Phone is still saved via our /api/credibly-leads/submit flow and email notification.
 *
 * @see https://knowledge.hubspot.com/forms/prepopulate-form-fields-with-a-query-string
 */
function buildCrediblyPrefillUrl(opts: {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
}): string {
  const params = new URLSearchParams();
  if (opts.firstName) params.set("firstname", opts.firstName);
  if (opts.lastName) params.set("lastname", opts.lastName);
  if (opts.email) params.set("email", opts.email);
  if (opts.company) params.set("company", opts.company);
  const qs = params.toString();
  return qs ? `${CREDIBLY_URL}?${qs}` : CREDIBLY_URL;
}

const REVENUE_OPTIONS = [
  { value: "", label: "Select monthly revenue" },
  { value: "under_15k", label: "Under $15,000" },
  { value: "15k_50k", label: "$15,000 – $50,000" },
  { value: "50k_100k", label: "$50,000 – $100,000" },
  { value: "100k_plus", label: "$100,000+" },
];

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function formatCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return "$" + Number(digits).toLocaleString("en-US");
}

type CrediblyLeadModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CrediblyLeadModal({ isOpen, onClose }: CrediblyLeadModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [monthlyRevenueRange, setMonthlyRevenueRange] = useState("");
  const [desiredAmount, setDesiredAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetAndClose = () => {
    setFirstName("");
    setLastName("");
    setBusinessName("");
    setEmail("");
    setPhone("");
    setMonthlyRevenueRange("");
    setDesiredAmount("");
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/credibly-leads/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          businessName,
          email,
          phone,
          monthlyRevenueRange: REVENUE_OPTIONS.find((o) => o.value === monthlyRevenueRange)?.label || monthlyRevenueRange,
          desiredAmount,
          source: "homepage_credibly_modal",
        }),
      });

      const data = await parseFetchJson<{ error?: string }>(response);
      if (!response.ok) {
        throw new Error(data.error || "Submission failed");
      }

      const crediblyUrl = buildCrediblyPrefillUrl({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        company: businessName.trim(),
      });

      resetAndClose();
      window.open(crediblyUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(messageFromPossibleJsonHtmlError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    businessName.trim() &&
    email.trim() &&
    phone.replace(/\D/g, "").length === 10 &&
    monthlyRevenueRange &&
    desiredAmount.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="credibly-modal-title">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={() => !isSubmitting && resetAndClose()}
          className="absolute right-4 top-4 text-2xl leading-none text-[#6F6F6F] hover:text-[#0B3D91]"
          aria-label="Close"
        >
          &times;
        </button>

        <div className="mb-6 pr-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#0B3D91]">Credibly partner path</p>
          <h2 id="credibly-modal-title" className="text-2xl font-semibold text-[#0B3D91]">
            Apply via Credibly
          </h2>
          <p className="mt-2 text-sm text-[#2A3E66]">
            Complete the fields below so we can save your details and notify our team. You&apos;ll then continue to{" "}
            <Link href={CREDIBLY_URL} target="_blank" rel="noopener noreferrer" className="underline">
              Credibly & Conduct Finance
            </Link>
            .
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#0B3D91]">First name *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-lg border-2 border-[#0B3D91] px-3 py-2.5 text-[#2A3E66]"
                autoComplete="given-name"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#0B3D91]">Last name *</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg border-2 border-[#0B3D91] px-3 py-2.5 text-[#2A3E66]"
                autoComplete="family-name"
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#0B3D91]">Business name *</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full rounded-lg border-2 border-[#0B3D91] px-3 py-2.5 text-[#2A3E66]"
              autoComplete="organization"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#0B3D91]">Business email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border-2 border-[#0B3D91] px-3 py-2.5 text-[#2A3E66]"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#0B3D91]">Business phone *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                className="w-full rounded-lg border-2 border-[#0B3D91] px-3 py-2.5 text-[#2A3E66]"
                autoComplete="tel"
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#0B3D91]">Average monthly revenue *</label>
            <select
              value={monthlyRevenueRange}
              onChange={(e) => setMonthlyRevenueRange(e.target.value)}
              className="w-full rounded-lg border-2 border-[#0B3D91] bg-white px-3 py-2.5 text-[#2A3E66]"
              required
            >
              {REVENUE_OPTIONS.map((o) => (
                <option key={o.value || "placeholder"} value={o.value} disabled={o.value === ""}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#0B3D91]">Desired funding amount *</label>
            <input
              type="text"
              inputMode="numeric"
              value={desiredAmount}
              onChange={(e) => setDesiredAmount(formatCurrencyInput(e.target.value))}
              className="w-full rounded-lg border-2 border-[#0B3D91] px-3 py-2.5 text-[#2A3E66]"
              placeholder="$50,000"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg border-2 border-[#991B1B] bg-[#FEF2F2] p-3 text-sm text-[#991B1B]">{error}</div>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => !isSubmitting && resetAndClose()}
              className="rounded-lg border-2 border-[#0B3D91] px-6 py-3 font-medium text-[#0B3D91] hover:bg-[#F5F5F5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className={`rounded-lg px-6 py-3 font-medium text-white transition-colors ${
                canSubmit && !isSubmitting ? "bg-[#0B3D91] hover:bg-[#0A2F72]" : "cursor-not-allowed bg-[#E5E5E5] text-[#6F6F6F]"
              }`}
            >
              {isSubmitting ? "Saving…" : "Save & continue to Credibly"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
