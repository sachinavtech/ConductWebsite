"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { trackPrequalStart, trackStepCompletion, trackCompletion, trackPrequalAbandon, trackRoutingResult } from "@/lib/analytics";
import { matchPartner, type MatchingResult } from "@/lib/partnerMatching";

interface Question {
  section: string;
  section_order: number;
  question_text: string;
  question_type: string;
  question_order: number;
  field_name: string;
  is_required: boolean;
  options: { value: string; label: string }[];
}

const QUESTIONS: Question[] = [
  // SECTION 1: Business Identity and Operating Model
  {
    section: "Business Identity and Operating Model",
    section_order: 1,
    question_text: "What is your Legal Business Name?",
    question_type: "text",
    question_order: 1,
    field_name: "legal_business_name",
    is_required: true,
    options: []
  },
  {
    section: "Business Identity and Operating Model",
    section_order: 1,
    question_text: "In which state is your business registered?",
    question_type: "dropdown",
    question_order: 2,
    field_name: "registration_state",
    is_required: true,
    options: [
      { value: "AL", label: "Alabama" }, { value: "AK", label: "Alaska" }, { value: "AZ", label: "Arizona" },
      { value: "AR", label: "Arkansas" }, { value: "CA", label: "California" }, { value: "CO", label: "Colorado" },
      { value: "CT", label: "Connecticut" }, { value: "DE", label: "Delaware" }, { value: "FL", label: "Florida" },
      { value: "GA", label: "Georgia" }, { value: "HI", label: "Hawaii" }, { value: "ID", label: "Idaho" },
      { value: "IL", label: "Illinois" }, { value: "IN", label: "Indiana" }, { value: "IA", label: "Iowa" },
      { value: "KS", label: "Kansas" }, { value: "KY", label: "Kentucky" }, { value: "LA", label: "Louisiana" },
      { value: "ME", label: "Maine" }, { value: "MD", label: "Maryland" }, { value: "MA", label: "Massachusetts" },
      { value: "MI", label: "Michigan" }, { value: "MN", label: "Minnesota" }, { value: "MS", label: "Mississippi" },
      { value: "MO", label: "Missouri" }, { value: "MT", label: "Montana" }, { value: "NE", label: "Nebraska" },
      { value: "NV", label: "Nevada" }, { value: "NH", label: "New Hampshire" }, { value: "NJ", label: "New Jersey" },
      { value: "NM", label: "New Mexico" }, { value: "NY", label: "New York" }, { value: "NC", label: "North Carolina" },
      { value: "ND", label: "North Dakota" }, { value: "OH", label: "Ohio" }, { value: "OK", label: "Oklahoma" },
      { value: "OR", label: "Oregon" }, { value: "PA", label: "Pennsylvania" }, { value: "RI", label: "Rhode Island" },
      { value: "SC", label: "South Carolina" }, { value: "SD", label: "South Dakota" }, { value: "TN", label: "Tennessee" },
      { value: "TX", label: "Texas" }, { value: "UT", label: "Utah" }, { value: "VT", label: "Vermont" },
      { value: "VA", label: "Virginia" }, { value: "WA", label: "Washington" }, { value: "WV", label: "West Virginia" },
      { value: "WI", label: "Wisconsin" }, { value: "WY", label: "Wyoming" }
    ]
  },
  {
    section: "Business Identity and Operating Model",
    section_order: 1,
    question_text: "What best describes your business model?",
    question_type: "dropdown",
    question_order: 3,
    field_name: "business_model",
    is_required: true,
    options: [
      { value: "B2B", label: "B2B (invoicing other businesses)" },
      { value: "B2C", label: "B2C (selling directly to customers)" },
      { value: "Marketplace", label: "Marketplace seller (Amazon, Shopify)" },
      { value: "Mixed", label: "Mixed (B2B and B2C)" },
      { value: "Subscription", label: "Subscription" }
    ]
  },
  {
    section: "Business Identity and Operating Model",
    section_order: 1,
    question_text: "What industry is your business in?",
    question_type: "dropdown",
    question_order: 4,
    field_name: "industry",
    is_required: true,
    options: [
      { value: "Trucking", label: "Trucking/Logistics" },
      { value: "Staffing", label: "Staffing/Recruiting" },
      { value: "Construction", label: "Construction" },
      { value: "Retail", label: "Retail" },
      { value: "Restaurant", label: "Restaurant/Food Service" },
      { value: "Medical", label: "Medical/Healthcare" },
      { value: "Wholesale", label: "Wholesale/Distribution" },
      { value: "Manufacturing", label: "Manufacturing" },
      { value: "Professional Services", label: "Professional Services (Consulting, Legal, Accounting)" },
      { value: "Technology", label: "Technology/SaaS" },
      { value: "Other", label: "Other" }
    ]
  },
  {
    section: "Business Identity and Operating Model",
    section_order: 1,
    question_text: "How do you get paid?",
    question_type: "checkbox",
    question_order: 5,
    field_name: "payment_methods",
    is_required: false,
    options: [
      { value: "Credit Card", label: "Credit Card" },
      { value: "ACH", label: "ACH/bank transfer" },
      { value: "Invoice", label: "Invoice net terms" },
      { value: "Cash", label: "Cash/check" }
    ]
  },
  {
    section: "Business Identity and Operating Model",
    section_order: 1,
    question_text: "What platforms do you use to run your business?",
    question_type: "checkbox",
    question_order: 6,
    field_name: "business_platforms",
    is_required: false,
    options: [
      { value: "Quickbooks", label: "Accounting (Quickbooks)" },
      { value: "Xero", label: "Accounting (Xero)" },
      { value: "Netsuite", label: "Accounting (Netsuite)" },
      { value: "Other Accounting", label: "Accounting (Other)" },
      { value: "Stripe", label: "Payments (Stripe)" },
      { value: "Square", label: "Payments (Square)" },
      { value: "Paypal", label: "Payments (Paypal)" },
      { value: "Other Payments", label: "Payments (Other)" },
      { value: "Shopify", label: "Commerce (Shopify)" },
      { value: "Amazon", label: "Commerce (Amazon)" },
      { value: "Etsy", label: "Commerce (Etsy)" },
      { value: "Gusto", label: "Payroll (Gusto)" },
      { value: "ADP", label: "Payroll (ADP)" }
    ]
  },
  // SECTION 2: Business Maturity and Stability
  {
    section: "Business Maturity and Stability",
    section_order: 2,
    question_text: "How long has the business been operating?",
    question_type: "dropdown",
    question_order: 1,
    field_name: "business_age",
    is_required: true,
    options: [
      { value: "< 6 months", label: "< 6 months" },
      { value: "6-24 months", label: "6-24 months" },
      { value: "2-5 years", label: "2-5 years" },
      { value: "5+ years", label: "5+ years" }
    ]
  },
  {
    section: "Business Maturity and Stability",
    section_order: 2,
    question_text: "What were the last 3 months of revenue?",
    question_type: "dropdown",
    question_order: 2,
    field_name: "revenue_3months",
    is_required: true,
    options: [
      { value: "no revenue", label: "no revenue" },
      { value: "< $25k/month", label: "< $25k/month" },
      { value: "$25k-100k/month", label: "$25k-100k/month" },
      { value: "$100k-500k/month", label: "$100k-500k/month" },
      { value: "$500k+ month", label: "$500k+ month" }
    ]
  },
  {
    section: "Business Maturity and Stability",
    section_order: 2,
    question_text: "What has been your revenue trend?",
    question_type: "dropdown",
    question_order: 3,
    field_name: "revenue_trend",
    is_required: true,
    options: [
      { value: "Growing", label: "Growing" },
      { value: "Flat", label: "Flat" },
      { value: "Seasonal", label: "Seasonal" },
      { value: "Declining", label: "Declining" }
    ]
  },
  // SECTION 3: Cash Flow
  {
    section: "Cash Flow",
    section_order: 3,
    question_text: "What is your biggest challenge?",
    question_type: "dropdown",
    question_order: 1,
    field_name: "biggest_challenge",
    is_required: true,
    options: [
      { value: "unpaid_invoices", label: "Cash flow gaps due to unpaid invoices from customers" },
      { value: "growth_capital", label: "Need capital for growth (hiring, inventory, expansion)" },
      { value: "day_to_day", label: "Covering day-to-day operating expenses" },
      { value: "equipment", label: "Purchasing equipment or machinery" },
      { value: "seasonal", label: "Managing seasonal cash flow fluctuations" }
    ]
  },
  {
    section: "Cash Flow",
    section_order: 3,
    question_text: "How predictable is your cashflow?",
    question_type: "dropdown",
    question_order: 2,
    field_name: "cashflow_predictability",
    is_required: true,
    options: [
      { value: "Predictable", label: "Predictable" },
      { value: "Somewhat predictable", label: "Somewhat predictable" },
      { value: "Lumpy/irregular", label: "Lumpy/irregular" }
    ]
  },
  {
    section: "Cash Flow",
    section_order: 3,
    question_text: "If a payment was higher than expected:",
    question_type: "dropdown",
    question_order: 3,
    field_name: "payment_impact",
    is_required: true,
    options: [
      { value: "No issue", label: "No issue" },
      { value: "Manageable", label: "Manageable" },
      { value: "Very Painful", label: "Very Painful" }
    ]
  },
  // SECTION 4: Credit Risk
  {
    section: "Credit Risk",
    section_order: 4,
    question_text: "Personal Credit of primary Business Owner",
    question_type: "dropdown",
    question_order: 1,
    field_name: "personal_credit",
    is_required: true,
    options: [
      { value: "Excellent", label: "Excellent (700+)" },
      { value: "Good", label: "Good (650-699)" },
      { value: "Fair", label: "Fair (600-649)" },
      { value: "Below 600", label: "Below 600" },
      { value: "Prefer not to say", label: "Prefer not to say / New to Credit" }
    ]
  },
  {
    section: "Credit Risk",
    section_order: 4,
    question_text: "Have you done Business Financing before?",
    question_type: "dropdown",
    question_order: 2,
    field_name: "previous_financing",
    is_required: true,
    options: [
      { value: "No", label: "No" },
      { value: "Loan", label: "Yes - loan" },
      { value: "MCA", label: "Yes - MCA or advance" },
      { value: "Invoice Financing", label: "Yes - invoice financing/factoring" }
    ]
  },
  {
    section: "Credit Risk",
    section_order: 4,
    question_text: "Do you currently have outstanding business financing?",
    question_type: "dropdown",
    question_order: 3,
    field_name: "current_financing",
    is_required: true,
    options: [
      { value: "No", label: "No" },
      { value: "Manageable", label: "Yes - manageable" },
      { value: "Strained", label: "Yes - strained" }
    ]
  },
  // SECTION 5: Preferences and Trust Signals
  {
    section: "Preferences and Trust Signals",
    section_order: 5,
    question_text: "What matters to you right now?",
    question_type: "dropdown",
    question_order: 1,
    field_name: "priority",
    is_required: true,
    options: [
      { value: "Lowest Cost", label: "Lowest total cost" },
      { value: "Fastest Access", label: "Fastest access to funds" },
      { value: "Flexibility", label: "Flexibility if sales slows down" }
    ]
  },
  {
    section: "Preferences and Trust Signals",
    section_order: 5,
    question_text: "How comfortable are you sharing real time business data to get better terms?",
    question_type: "dropdown",
    question_order: 2,
    field_name: "data_sharing_comfort",
    is_required: true,
    options: [
      { value: "Very comfortable", label: "Very comfortable" },
      { value: "Somewhat", label: "Somewhat" },
      { value: "Not comfortable", label: "Not comfortable" }
    ]
  },
  {
    section: "Preferences and Trust Signals",
    section_order: 5,
    question_text: "Would you prefer?",
    question_type: "dropdown",
    question_order: 3,
    field_name: "preference_type",
    is_required: true,
    options: [
      { value: "One Recommendation", label: "One clear recommended option for product and lender" },
      { value: "Comparison", label: "A comparison of a few options" },
      { value: "Education", label: "Just education for now" }
    ]
  },
  {
    section: "Preferences and Trust Signals",
    section_order: 5,
    question_text: "How quickly do you need access to funds?",
    question_type: "dropdown",
    question_order: 4,
    field_name: "funds_timing",
    is_required: true,
    options: [
      { value: "same_day", label: "Same day or within a few days" },
      { value: "1_2_weeks", label: "Within 1–2 weeks" },
      { value: "flexible", label: "Flexible timing" }
    ]
  },
  {
    section: "Preferences and Trust Signals",
    section_order: 5,
    question_text: "How do you prefer to repay the funds?",
    question_type: "dropdown",
    question_order: 5,
    field_name: "repayment_preference",
    is_required: true,
    options: [
      { value: "daily_weekly", label: "Daily or weekly payments tied to sales" },
      { value: "monthly_fixed", label: "Monthly fixed payments" },
      { value: "interest_only", label: "Only pay interest on what I use" }
    ]
  },
  {
    section: "Preferences and Trust Signals",
    section_order: 5,
    question_text: "Email address (for receiving options)",
    question_type: "text",
    question_order: 6,
    field_name: "email",
    is_required: true,
    options: []
  }
];

const SECTIONS = Array.from(new Set(QUESTIONS.map(q => q.section))).sort(
  (a, b) => QUESTIONS.find(q => q.section === a)!.section_order - QUESTIONS.find(q => q.section === b)!.section_order
);

export default function Questionnaire() {
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [matchingResult, setMatchingResult] = useState<MatchingResult | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const hasTrackedAbandon = useRef<boolean>(false);

  const currentSectionName = SECTIONS[currentSection];
  const sectionQuestions = QUESTIONS.filter(q => q.section === currentSectionName);
  const progress = ((currentSection + 1) / SECTIONS.length) * 100;

  // Track prequal start on mount
  useEffect(() => {
    trackPrequalStart();
    startTimeRef.current = Date.now();
  }, []);

  // Track abandonment when user leaves the page without completing
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!submitted && !hasTrackedAbandon.current) {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        trackPrequalAbandon(currentSection + 1, currentSectionName, timeSpent);
        hasTrackedAbandon.current = true;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also track if component unmounts (user navigates away)
      if (!submitted && !hasTrackedAbandon.current) {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        trackPrequalAbandon(currentSection + 1, currentSectionName, timeSpent);
        hasTrackedAbandon.current = true;
      }
    };
  }, [submitted, currentSection, currentSectionName]);

  const handleInputChange = (fieldName: string, value: string) => {
    setAnswers(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleCheckboxChange = (fieldName: string, value: string, checked: boolean) => {
    setAnswers(prev => {
      const current = Array.isArray(prev[fieldName]) ? prev[fieldName] as string[] : [];
      if (checked) {
        return { ...prev, [fieldName]: [...current, value] };
      } else {
        return { ...prev, [fieldName]: current.filter((v: string) => v !== value) };
      }
    });
  };

  const isSectionComplete = () => {
    return sectionQuestions.every(q => {
      if (!q.is_required) return true;
      const answer = answers[q.field_name];
      if (q.question_type === "checkbox") {
        return Array.isArray(answer) && answer.length > 0;
      }
      return answer !== undefined && answer !== "";
    });
  };

  const handleNext = () => {
    if (isSectionComplete() && currentSection < SECTIONS.length - 1) {
      // Track step completion before moving to next section
      trackStepCompletion(currentSection + 1, currentSectionName);
      setCurrentSection(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    if (!isSectionComplete()) return;
    
    setIsSubmitting(true);
    try {
      const email = answers.email as string;
      if (!email) {
        alert("Please provide your email address.");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/questionnaire/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit your information');
      }

      // Determine partner match
      const match = matchPartner(answers);
      setMatchingResult(match);

      // Track questionnaire completion
      trackCompletion(answers);

      // Track routing result
      if (match.partner) {
        trackRoutingResult(
          match.productType,
          typeof answers.revenue_3months === 'string' ? answers.revenue_3months : undefined,
          typeof answers.business_model === 'string' ? answers.business_model : undefined
        );
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting questionnaire:", error);
      alert(`There was an error submitting your information: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    const hasMatch = matchingResult?.partner !== null;

    return (
      <main className="flex items-center justify-center min-h-screen bg-white text-[#1A1A1A] py-12">
        <div className="text-center max-w-3xl mx-auto px-6">
          <div className="mb-8">
            <Link href="/">
              <img src="/logo.svg" alt="Conduct Logo" className="w-32 md:w-40 mx-auto mb-8 cursor-pointer hover:opacity-80 transition-opacity" />
            </Link>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-6">
            {hasMatch ? "We Found a Match!" : "Thank You!"}
          </h1>

          {hasMatch ? (
            <div className="mb-10">
              <div className="bg-[#F5F5F5] border-2 border-[#1A1A1A] rounded-lg p-8 mb-6">
                <p className="text-lg md:text-xl text-[#4A4A4A] mb-4 leading-relaxed">
                  Great news! We&apos;ve found a lender match for your business.
                </p>
                <p className="text-lg md:text-xl text-[#4A4A4A] leading-relaxed">
                  We&apos;ll send you detailed information about your match and next steps within 24 hours.
                </p>
              </div>
              <p className="text-[#4A4A4A] text-lg md:text-xl mb-6 leading-relaxed">
                Check your email for updates. We&apos;ve also sent a confirmation to your inbox.
              </p>
            </div>
          ) : (
            <div className="mb-10">
              <div className="bg-[#F5F5F5] border-2 border-[#1A1A1A] rounded-lg p-8 mb-6">
                <p className="text-lg md:text-xl text-[#4A4A4A] mb-4 leading-relaxed">
                  We didn&apos;t find a match in our current lender network for your specific needs.
                </p>
                <p className="text-lg md:text-xl text-[#4A4A4A] leading-relaxed">
                  We&apos;re actively working to expand our lender network and will reach out to you in the future if we find a match.
                </p>
              </div>
              <p className="text-[#4A4A4A] text-lg md:text-xl mb-6 leading-relaxed">
                Thank you for your interest. We&apos;ll keep your information on file and notify you when we have new options available.
              </p>
            </div>
          )}

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

  return (
    <main className="flex items-center justify-center min-h-screen bg-white text-[#1A1A1A] py-12">
      <div className="w-full max-w-3xl mx-auto px-6">
        <div className="mb-8">
          <Link href="/">
            <img src="/logo.svg" alt="Conduct Logo" className="w-32 md:w-40 mx-auto mb-8 cursor-pointer hover:opacity-80 transition-opacity" />
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-[#6F6F6F]">
              Section {currentSection + 1} of {SECTIONS.length}
            </span>
            <span className="text-sm text-[#6F6F6F]">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-[#E5E5E5] rounded-full h-2">
            <div
              className="bg-[#1A1A1A] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2">
            The Smart Path to Business Capital.
          </h1>
          <p className="text-[#4A4A4A] text-lg">
            Tell us about your business to get matched with the right lender
          </p>
        </div>

        {/* Section Title */}
        <h2 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-6 text-center">
          {currentSectionName}
        </h2>

        {/* Questions */}
        <div className="space-y-8 mb-10">
          {sectionQuestions.map((question) => (
            <div key={question.field_name} className="space-y-3">
              <label className="block text-lg md:text-xl font-medium text-[#1A1A1A]">
                {question.question_text}
                {question.is_required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {question.question_type === "text" && (
                <input
                  type="text"
                  value={answers[question.field_name] || ""}
                  onChange={(e) => handleInputChange(question.field_name, e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#1A1A1A] rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:ring-offset-2"
                  placeholder="Enter your answer"
                />
              )}

              {question.question_type === "dropdown" && (
                <select
                  value={answers[question.field_name] || ""}
                  onChange={(e) => handleInputChange(question.field_name, e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#1A1A1A] rounded-lg text-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:ring-offset-2"
                >
                  <option value="">Select an option</option>
                  {question.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {question.question_type === "checkbox" && (
                <div className="space-y-3">
                  {question.options.map((option) => (
                    <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={(answers[question.field_name] || []).includes(option.value)}
                        onChange={(e) => handleCheckboxChange(question.field_name, option.value, e.target.checked)}
                        className="w-5 h-5 border-2 border-[#1A1A1A] rounded focus:ring-2 focus:ring-[#1A1A1A] text-[#1A1A1A] cursor-pointer"
                      />
                      <span className="text-lg text-[#4A4A4A] group-hover:text-[#1A1A1A]">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-8 border-t border-[#E5E5E5]">
          <button
            onClick={handlePrevious}
            disabled={currentSection === 0}
            className={`px-6 py-3 rounded-lg text-lg font-medium transition-colors duration-200 ${
              currentSection === 0
                ? "text-[#6F6F6F] cursor-not-allowed"
                : "text-[#1A1A1A] hover:text-[#4A4A4A]"
            }`}
          >
            ← Previous
          </button>

          {currentSection < SECTIONS.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isSectionComplete()}
              className={`px-8 py-3 rounded-lg text-lg font-medium transition-colors duration-200 ${
                isSectionComplete()
                  ? "bg-[#1A1A1A] text-white hover:bg-[#333333]"
                  : "bg-[#E5E5E5] text-[#6F6F6F] cursor-not-allowed"
              }`}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isSectionComplete() || isSubmitting}
              className={`px-8 py-3 rounded-lg text-lg font-medium transition-colors duration-200 ${
                isSectionComplete() && !isSubmitting
                  ? "bg-[#1A1A1A] text-white hover:bg-[#333333]"
                  : "bg-[#E5E5E5] text-[#6F6F6F] cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
