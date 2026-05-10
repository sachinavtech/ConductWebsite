"use client";

import Link from "next/link";

export default function UnderwritingGuidelinesPage() {
  return (
    <main className="min-h-screen bg-white text-[#0B3D91]">
      <header className="w-full pt-4 pl-4 md:pt-6 md:pl-6">
        <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
          <img src="/logo.svg" alt="Conduct Logo" className="w-40 md:w-48" />
        </Link>
      </header>

      <section className="py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">Underwriting Guidelines</h1>
          <p className="text-sm text-[#6F6F6F] mb-8">
            Last updated: May 1, 2026. These guidelines summarize typical criteria used in our business cash advance
            pre-qualification and partner matching process. Final approvals, offers, and documentation requirements
            are determined by individual funding partners and may differ from this summary.
          </p>

          <div className="space-y-8 text-[#2A3E66] leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-[#0B3D91] mb-2">Eligibility overview</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>U.S.-based operating business with a valid Employer Identification Number (EIN).</li>
                <li>
                  Business banking activity sufficient to support repayment analysis (typically demonstrated via
                  linked accounts or recent bank statements).
                </li>
                <li>Authorized owner or officer completing the application on behalf of the business.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#0B3D91] mb-2">Business performance</h2>
              <p>
                Underwriting evaluates recurring revenue and cash-flow stability using deposits, average balances,
                negative days, overdrafts, and related signals from bank data. Strong, consistent inflows relative to
                requested advance size generally improve outcomes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#0B3D91] mb-2">Credit and verification</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  A soft credit inquiry may be used for identity verification and risk assessment where permitted.
                  This does not impact personal credit scores in the same way as a hard inquiry.
                </li>
                <li>
                  There is no universal minimum bureau score requirement; decisions emphasize business bank
                  performance and overall risk profile.
                </li>
                <li>Additional verification may be requested to confirm ownership and business legitimacy.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#0B3D91] mb-2">Requested advance amount</h2>
              <p>
                Advance requests are evaluated against demonstrated deposit volume and underwriting metrics.
                Requests outside supported ranges or inconsistent with cash flow may be declined or referred for
                alternative structures.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#0B3D91] mb-2">Documentation</h2>
              <p>You may be asked to provide:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Government-issued photo ID (e.g., driver&apos;s license).</li>
                <li>Voided business check for deposit verification.</li>
                <li>Proof of EIN (e.g., IRS SS-4 confirmation letter or comparable verification).</li>
                <li>
                  Recent business bank statements (often the last three months, or equivalent coverage via secure
                  bank connection).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#0B3D91] mb-2">Industries and risk factors</h2>
              <p>
                Certain industries and business models may receive additional scrutiny or may not be eligible for
                programs available through our network. Examples can include businesses with elevated regulatory
                risk, inconsistent revenue, or elevated chargeback exposure. Eligibility is assessed case by case.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#0B3D91] mb-2">Transparency and timing</h2>
              <p>
                Offers should clearly disclose rates, fees, repayment structure, and obligations before you accept
                funding. Many merchants receive decisions quickly; funding timing depends on verification completeness
                and partner processes.
              </p>
            </section>

            <section>
              <p className="text-sm text-[#6F6F6F]">
                Questions?{" "}
                <Link href="/contact" className="text-[#0B3D91] underline hover:opacity-80">
                  Contact us
                </Link>
                {" · "}
                <Link href="/terms-privacy" className="text-[#0B3D91] underline hover:opacity-80">
                  Terms and Privacy Policy
                </Link>
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
