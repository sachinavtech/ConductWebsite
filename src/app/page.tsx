import Link from "next/link";

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-white text-[#1A1A1A] py-12">
      <div className="text-center max-w-2xl mx-auto px-6">
        <div className="mb-4">
          <img src="/logo.svg" alt="Conduct Logo" className="w-40 md:w-48 mx-auto mb-16" />
        </div>

        <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-6">
          A smarter way to choose business financing.
        </h1>

        <p className="text-[#4A4A4A] text-lg md:text-xl mb-10 leading-relaxed">
          Not sure which financing fits your business? We help you decide before you commit.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
          <Link
            href="/questionnaire"
            className="inline-block bg-[#1A1A1A] text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#333333] transition-colors duration-200"
          >
            Start Questionnaire
          </Link>
          <a
            href="mailto:sachin@conductfinance.com?subject=Embedded credit for B2B commerce&body=Hi%20Conduct%20team,%0A%0AI%20would%20like%20to%20learn%20more%20about%20your%20embedded%20credit%20layer%20for%20B2B%20commerce.%20Please%20share%20a%20time%20to%20connect."
            className="inline-block border-2 border-[#1A1A1A] text-[#1A1A1A] px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#1A1A1A] hover:text-white transition-colors duration-200"
          >
            Talk to the team
          </a>
        </div>

        <p className="text-[#6F6F6F] text-sm">
          Conduct Finance helps small businesses identify the right financing product based on cash-flow behavior and business model — without rate shopping or pressure.
        </p>
      </div>
    </main>
  );
}


