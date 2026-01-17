export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-white text-[#1A1A1A]">
      <div className="text-center max-w-2xl mx-auto px-6">
        <div className="mb-4">
          <img src="/logo.svg" alt="Conduct Logo" className="w-40 md:w-48 mx-auto mb-16" />
        </div>

        <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-6">
          Embedded credit layer for B2B commerce
        </h1>

        <p className="text-[#4A4A4A] text-lg md:text-xl mb-10 leading-relaxed">
          Deploy Conduct&apos;s underwriting, decisioning, and servicing infrastructure to extend flexible net terms at checkout,
          without rebuilding your lending stack from scratch.
        </p>

        <a
          href="mailto:founders@conductfinance.com?subject=Embedded credit for B2B commerce&body=Hi%20Conduct%20team,%0A%0AI%20would%20like%20to%20learn%20more%20about%20your%20embedded%20credit%20layer%20for%20B2B%20commerce.%20Please%20share%20a%20time%20to%20connect."
          className="inline-block bg-[#1A1A1A] text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#333333] transition-colors duration-200 mb-8"
        >
          Talk to the team
        </a>

        <p className="text-[#6F6F6F] text-sm">
          Conduct enables B2B marketplaces, distributors, and SaaS platforms to launch embedded credit programs in weeks.
        </p>

        <div className="mt-6 pt-8 border-t border-[#E5E5E5]">
          <p className="text-[#4A4A4A] text-sm">
            © 2025 Conduct Finance Inc. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}


