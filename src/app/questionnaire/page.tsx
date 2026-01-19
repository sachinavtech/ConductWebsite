import Link from "next/link";

export default function Questionnaire() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-white text-[#1A1A1A] py-12">
      <div className="text-center max-w-3xl mx-auto px-6">
        <div className="mb-8">
          <Link href="/">
            <img src="/logo.svg" alt="Conduct Logo" className="w-32 md:w-40 mx-auto mb-8 cursor-pointer hover:opacity-80 transition-opacity" />
          </Link>
        </div>

        <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-6">
          Find Your Perfect Financing Match
        </h1>

        <p className="text-[#4A4A4A] text-lg md:text-xl mb-12 leading-relaxed">
          Answer a few quick questions about your business, and we&apos;ll help you identify the financing solution that fits your needs.
        </p>

        <div className="bg-[#F9F9F9] rounded-lg p-8 md:p-12 mb-8">
          <p className="text-[#6F6F6F] text-base mb-6">
            Questionnaire coming soon...
          </p>
          <p className="text-[#4A4A4A] text-sm">
            We&apos;re building a smart questionnaire to match you with the right financing options. 
            In the meantime, feel free to reach out to our team.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="inline-block text-[#1A1A1A] px-6 py-3 rounded-lg text-lg font-medium hover:text-[#4A4A4A] transition-colors duration-200"
          >
            ← Back to Home
          </Link>
          <a
            href="mailto:sachin@conductfinance.com?subject=Financing Consultation&body=Hi%20Conduct%20team,%0A%0AI%20would%20like%20to%20learn%20more%20about%20financing%20options%20for%20my%20business.%20Please%20share%20a%20time%20to%20connect."
            className="inline-block bg-[#1A1A1A] text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#333333] transition-colors duration-200"
          >
            Talk to the team
          </a>
        </div>
      </div>
    </main>
  );
}

