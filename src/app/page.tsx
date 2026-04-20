"use client";

import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#1A1A1A]">
      {/* Header */}
      <header className="w-full pt-4 pl-4 md:pt-6 md:pl-6">
        <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
          <img src="/logo.svg" alt="Conduct Logo" className="w-40 md:w-48" />
        </Link>
      </header>

      {/* Hero Section */}
      <section className="flex items-center justify-center min-h-[50vh] py-8">
        <div className="text-center max-w-3xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-semibold leading-tight tracking-tight mb-6">
            The Smart Path to MCA Funding.
          </h1>

          <p className="text-[#4A4A4A] text-xl md:text-2xl mb-8 leading-relaxed max-w-2xl mx-auto">
            One short application. We verify your business, pull credit softly, and analyze your bank statements automatically — then match you with the right MCA lender.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-[#F5F5F5]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-semibold text-center mb-16">
            How it works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12 md:gap-16 mb-16">
            {/* Step 1 */}
            <div className="text-center">
              <div className="mb-8">
                <div className="w-24 h-24 bg-[#1A1A1A] rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white text-4xl font-bold">1</span>
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-semibold mb-4">
                Submit your application
              </h3>
              <p className="text-[#4A4A4A] text-lg md:text-xl leading-relaxed">
                Enter your EIN, owner info, and upload 3 bank statements. That&apos;s it — takes under 5 minutes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="mb-8">
                <div className="w-24 h-24 bg-[#1A1A1A] rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white text-4xl font-bold">2</span>
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-semibold mb-4">
                We do the underwriting
              </h3>
              <p className="text-[#4A4A4A] text-lg md:text-xl leading-relaxed">
                Middesk verifies your business. A soft credit pull runs automatically. Our system analyzes your bank statements for deposits, overdrafts, and cash flow.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="mb-8">
                <div className="w-24 h-24 bg-[#1A1A1A] rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white text-4xl font-bold">3</span>
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-semibold mb-4">
                Get matched and funded
              </h3>
              <p className="text-[#4A4A4A] text-lg md:text-xl leading-relaxed">
                We match you with the best MCA lender for your profile. Many businesses receive funding within 24-48 hours of approval.
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/questionnaire"
                className="inline-block bg-[#1A1A1A] text-white px-10 py-4 rounded-lg text-lg font-medium hover:bg-[#333333] transition-colors duration-200"
              >
                Apply for MCA Loans
              </Link>
              <Link
                href="/contact"
                className="inline-block border-2 border-[#1A1A1A] text-[#1A1A1A] px-10 py-4 rounded-lg text-lg font-medium hover:bg-[#1A1A1A] hover:text-white transition-colors duration-200"
              >
                Talk to the team
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-semibold text-center mb-16">
            Why use Conduct for MCA?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="border-l-4 border-[#1A1A1A] pl-6">
              <h3 className="text-2xl font-semibold mb-4">Deposits Over FICO</h3>
              <p className="text-[#4A4A4A] text-lg md:text-xl leading-relaxed">
                MCA approval is driven by your bank deposits, not your credit score. If you do $15K+/month in deposits, you likely qualify &mdash; even with a 500-600 FICO.
              </p>
            </div>
            
            <div className="border-l-4 border-[#1A1A1A] pl-6">
              <h3 className="text-2xl font-semibold mb-4">Soft Pull First</h3>
              <p className="text-[#4A4A4A] text-lg md:text-xl leading-relaxed">
                We start with a soft credit pull that doesn&rsquo;t affect your score. A hard pull only happens at final funding &mdash; and many funders approve on soft pull alone.
              </p>
            </div>
            
            <div className="border-l-4 border-[#1A1A1A] pl-6">
              <h3 className="text-2xl font-semibold mb-4">Speed to Funding</h3>
              <p className="text-[#4A4A4A] text-lg md:text-xl leading-relaxed">
                MCA is one of the fastest paths to capital. Many businesses receive funds within 24-48 hours of approval. No collateral required.
              </p>
            </div>
            
            <div className="border-l-4 border-[#1A1A1A] pl-6">
              <h3 className="text-2xl font-semibold mb-4">Transparent Matching</h3>
              <p className="text-[#4A4A4A] text-lg md:text-xl leading-relaxed">
                We tell you exactly why you do or don&rsquo;t qualify, what drives MCA pricing, and what to improve. No black boxes, no surprises.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA for Lenders */}
      <section className="py-20 bg-[#1A1A1A] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-semibold mb-6">
            MCA funders: upgrade your deal flow
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Integrate our scoring engine into your underwriting workflow or receive pre-scored MCA leads directly to your CRM.
          </p>
          <Link
            href="/lender-inquiry"
            className="inline-block bg-white text-[#1A1A1A] px-10 py-4 rounded-lg text-lg font-medium hover:bg-gray-200 transition-colors duration-200"
          >
            Get Started
          </Link>
        </div>
      </section>
    </main>
  );
}
