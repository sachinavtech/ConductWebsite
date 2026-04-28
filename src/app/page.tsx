"use client";

import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#0B3D91]">
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
            The Smart Path to Business Cash Advance Funding Today.
          </h1>

          <p className="text-[#2A3E66] text-xl md:text-2xl mb-8 leading-relaxed max-w-2xl mx-auto">
            One short application. We verify your business, pull credit softly, and analyze your bank statements automatically, then match you with the right lender.
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
                <div className="w-24 h-24 bg-[#0B3D91] rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white text-4xl font-bold">1</span>
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-semibold mb-4">
                Submit your application
              </h3>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="mb-8">
                <div className="w-24 h-24 bg-[#0B3D91] rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white text-4xl font-bold">2</span>
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-semibold mb-4">
                We do the underwriting
              </h3>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="mb-8">
                <div className="w-24 h-24 bg-[#0B3D91] rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white text-4xl font-bold">3</span>
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-semibold mb-4">
                Get matched and funded
              </h3>
            </div>
          </div>

          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/questionnaire"
                className="inline-block bg-[#0B3D91] text-white px-10 py-4 rounded-lg text-lg font-medium hover:bg-[#0A2F72] transition-colors duration-200"
              >
                Apply for Business Cash Advance Loans
              </Link>
              <Link
                href="/contact"
                className="inline-block border-2 border-[#0B3D91] text-[#0B3D91] px-10 py-4 rounded-lg text-lg font-medium hover:bg-[#0B3D91] hover:text-white transition-colors duration-200"
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
            Why use Conduct for Business Cash Advance?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="border-l-4 border-[#0B3D91] pl-6">
              <h3 className="text-2xl font-semibold mb-4">Instant Funding</h3>
              <p className="text-[#2A3E66] text-lg md:text-xl leading-relaxed">
                You can get matched quickly and receive funding in as little as 24 to 48 hours.
              </p>
            </div>
            
            <div className="border-l-4 border-[#0B3D91] pl-6">
              <h3 className="text-2xl font-semibold mb-4">Completely Digital Application</h3>
              <p className="text-[#2A3E66] text-lg md:text-xl leading-relaxed">
                Our fully digital process takes less than a minute to start and can be completed from anywhere.
              </p>
            </div>
            
            <div className="border-l-4 border-[#0B3D91] pl-6">
              <h3 className="text-2xl font-semibold mb-4">No Minimum FICO or Bureau Scores</h3>
              <p className="text-[#2A3E66] text-lg md:text-xl leading-relaxed">
                Underwriting is machine learning based and focused on your revenue performance and overall business strength.
              </p>
            </div>
            
            <div className="border-l-4 border-[#0B3D91] pl-6">
              <h3 className="text-2xl font-semibold mb-4">White Glove Concierge Service</h3>
              <p className="text-[#2A3E66] text-lg md:text-xl leading-relaxed">
                Our team supports you one on one throughout the process so you can move from application to funding with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA for Lenders */}
      <section className="py-20 bg-[#0B3D91] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-semibold mb-6">
            Business Cash Advance funders: upgrade your deal flow
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Integrate our scoring engine into your underwriting workflow or receive pre-scored leads directly to your CRM.
          </p>
          <Link
            href="/lender-inquiry"
            className="inline-block bg-white text-[#0B3D91] px-10 py-4 rounded-lg text-lg font-medium hover:bg-gray-200 transition-colors duration-200"
          >
            Get Started
          </Link>
        </div>
      </section>
    </main>
  );
}
