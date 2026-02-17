"use client";

import Link from "next/link";
import { trackPrequalStart } from "@/lib/analytics";

export default function Home() {
  const handleQuestionnaireClick = () => {
    trackPrequalStart();
  };
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
            The Smart Path to Business Capital.
          </h1>

          <p className="text-[#4A4A4A] text-xl md:text-2xl mb-8 leading-relaxed max-w-2xl mx-auto">
            Get matched to the right lender and right product with competitive rates and fees. Powered by AI to find your perfect financing fit.
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
                Describe your needs
              </h3>
              <p className="text-[#4A4A4A] text-lg md:text-xl leading-relaxed">
                Answer a few questions about your business in as little as five minutes. Our AI analyzes your business model, industry, and financing needs.
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
                Get matched instantaneously
              </h3>
              <p className="text-[#4A4A4A] text-lg md:text-xl leading-relaxed">
                Receive your personalized lender match immediately. See why this partner fits your business, recommended products, and next steps.
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
                Apply
              </h3>
              <p className="text-[#4A4A4A] text-lg md:text-xl leading-relaxed">
                Connect directly with your matched lender. Compare rates, terms, and fees. Submit your application and secure your business loan.
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/questionnaire"
                onClick={handleQuestionnaireClick}
                className="inline-block bg-[#1A1A1A] text-white px-10 py-4 rounded-lg text-lg font-medium hover:bg-[#333333] transition-colors duration-200"
              >
                Get Matched
              </Link>
              <Link
                href="/risk-score"
                className="inline-block border-2 border-[#1A1A1A] text-[#1A1A1A] px-10 py-4 rounded-lg text-lg font-medium hover:bg-[#1A1A1A] hover:text-white transition-colors duration-200"
              >
                Check Your Conduct Risk Score
              </Link>
              <a
                href="mailto:sachin@conductfinance.com?subject=Embedded credit for B2B commerce&body=Hi%20Conduct%20team,%0A%0AI%20would%20like%20to%20learn%20more%20about%20your%20embedded%20credit%20layer%20for%20B2B%20commerce.%20Please%20share%20a%20time%20to%20connect."
                className="inline-block border-2 border-[#1A1A1A] text-[#1A1A1A] px-10 py-4 rounded-lg text-lg font-medium hover:bg-[#1A1A1A] hover:text-white transition-colors duration-200"
              >
                Talk to the team
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-semibold text-center mb-16">
            Why use our matching service?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="border-l-4 border-[#1A1A1A] pl-6">
              <h3 className="text-2xl font-semibold mb-4">AI-Powered Matching</h3>
              <p className="text-[#4A4A4A] text-lg md:text-xl leading-relaxed">
                Our intelligent system analyzes your business profile to find the perfect lender match based on your industry, needs, and credit profile.
              </p>
            </div>
            
            <div className="border-l-4 border-[#1A1A1A] pl-6">
              <h3 className="text-2xl font-semibold mb-4">Instant Results</h3>
              <p className="text-[#4A4A4A] text-lg md:text-xl leading-relaxed">
                No waiting days for matches. Get your personalized recommendation immediately after completing the questionnaire.
              </p>
            </div>
            
            <div className="border-l-4 border-[#1A1A1A] pl-6">
              <h3 className="text-2xl font-semibold mb-4">No Pressure</h3>
              <p className="text-[#4A4A4A] text-lg md:text-xl leading-relaxed">
                Compare rates, terms, and fees at your own pace. We help you decide before you commit, without the sales pressure.
              </p>
            </div>
            
            <div className="border-l-4 border-[#1A1A1A] pl-6">
              <h3 className="text-2xl font-semibold mb-4">Trusted Partners</h3>
              <p className="text-[#4A4A4A] text-lg md:text-xl leading-relaxed">
                Connect with verified lenders who specialize in your industry and business model. All partners are carefully vetted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA for Lenders */}
      <section className="py-20 bg-[#1A1A1A] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-semibold mb-6">
            Ready to upgrade your deal flow?
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Integrate our scoring engine into your existing underwriting workflow or receive pre-scored leads directly to your CRM.
          </p>
          <a
            href="mailto:sachin@conductfinance.com?subject=Lender Partnership Inquiry&body=Hi%20Conduct%20team,%0A%0AI%20would%20like%20to%20learn%20more%20about%20integrating%20your%20scoring%20engine%20or%20receiving%20pre-scored%20leads.%20Please%20share%20a%20time%20to%20connect."
            className="inline-block bg-white text-[#1A1A1A] px-10 py-4 rounded-lg text-lg font-medium hover:bg-gray-200 transition-colors duration-200"
          >
            Get Started
          </a>
        </div>
      </section>
    </main>
  );
}


