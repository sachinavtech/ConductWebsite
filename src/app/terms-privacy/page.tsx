"use client";

import Link from "next/link";

export default function TermsPrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-[#0B3D91]">
      <header className="w-full pt-4 pl-4 md:pt-6 md:pl-6">
        <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
          <img src="/logo.svg" alt="Conduct Logo" className="w-40 md:w-48" />
        </Link>
      </header>

      <section className="py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-semibold mb-6">
            Terms and Conditions and Privacy Policy
          </h1>
          <p className="text-sm text-[#6F6F6F] mb-8">Last updated: May 1, 2026</p>

          <div className="space-y-8 text-[#2A3E66] leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-[#0B3D91] mb-2">1. Acceptance of Terms</h2>
              <p>
                By using Conduct Finance&apos;s website, forms, and application workflow, you agree to these
                Terms and Conditions and our Privacy Policy. If you do not agree, do not use this website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#0B3D91] mb-2">2. Service Description</h2>
              <p>
                Conduct Finance provides a digital pre-qualification and matching workflow for business cash
                advance and related commercial funding products. Submitting an application does not guarantee
                approval, terms, or funding.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#0B3D91] mb-2">3. Information You Provide</h2>
              <p>
                You represent that all information you provide is accurate and that you are authorized to submit
                information on behalf of the business. You consent to identity verification, soft credit inquiry,
                and sharing application data with potential funding partners.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#0B3D91] mb-2">4. Required Documents</h2>
              <p>
                For underwriting and verification, we may request supporting documents including a driver&apos;s
                license, void check, proof of EIN, and bank statements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#0B3D91] mb-2">5. Privacy and Data Use</h2>
              <p>
                We collect business and personal information to operate the platform, evaluate applications,
                communicate with you, and connect you with potential funding providers. We use reasonable
                safeguards to protect your information and limit access to authorized personnel and trusted service
                providers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#0B3D91] mb-2">6. Communications Consent</h2>
              <p>
                By submitting forms, you agree to receive communications from Conduct Finance and its partners by
                email, phone, and SMS regarding your inquiry or application, subject to applicable law. You may opt
                out of marketing communications at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#0B3D91] mb-2">7. Governing Law</h2>
              <p>
                These Terms and any dispute relating to your use of this website or services are governed by the
                laws of the State of California, without regard to conflict-of-law principles.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#0B3D91] mb-2">8. Changes to These Terms</h2>
              <p>
                We may update these Terms and Privacy Policy from time to time by posting a revised version on this
                page. Your continued use of the site after updates means you accept the revised terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#0B3D91] mb-2">9. Contact</h2>
              <p>
                If you have questions about these Terms or our Privacy Policy, please contact us through the
                contact page.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
