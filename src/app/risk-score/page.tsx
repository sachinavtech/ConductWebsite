"use client";

import { useState } from "react";
import Link from "next/link";

interface RiskScoreData {
  // Part 1: Must-Haves (KYB/State Verification)
  legal_business_name: string;
  doing_business_as: string;
  state_of_incorporation: string;
  entity_type: string;
  ein: string;
  business_physical_address: string;
  date_of_formation: string;
  
  // Part 2: Conduct Score (Alternative Data)
  corporate_website_url: string;
  linkedin_company_page_url: string;
  facebook_business_page_url: string;
  yelp_google_business_profile_url: string;
  business_phone_number: string;
  primary_bank_account_last_4: string;
  
  // Contact info
  email: string;
}

export default function RiskScore() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RiskScoreData>({
    legal_business_name: "",
    doing_business_as: "",
    state_of_incorporation: "",
    entity_type: "",
    ein: "",
    business_physical_address: "",
    date_of_formation: "",
    corporate_website_url: "",
    linkedin_company_page_url: "",
    facebook_business_page_url: "",
    yelp_google_business_profile_url: "",
    business_phone_number: "",
    primary_bank_account_last_4: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field: keyof RiskScoreData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isStepComplete = (step: number): boolean => {
    if (step === 1) {
      return !!(
        formData.legal_business_name &&
        formData.state_of_incorporation &&
        formData.entity_type &&
        formData.ein &&
        formData.business_physical_address &&
        formData.date_of_formation
      );
    }
    if (step === 2) {
      return !!(
        formData.corporate_website_url &&
        formData.business_phone_number &&
        formData.email
      );
    }
    return true;
  };

  const handleNext = () => {
    if (isStepComplete(currentStep) && currentStep < 2) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    if (!isStepComplete(currentStep)) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/risk-score/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        const details = typeof data?.details === 'string' && data.details ? ` (${data.details})` : '';
        throw new Error(`${data?.error || 'Failed to submit risk score information'}${details}`);
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting risk score:", error);
      alert(`There was an error submitting your information: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-white text-[#1A1A1A] py-12">
        <div className="text-center max-w-2xl mx-auto px-6">
          <div className="mb-8">
            <Link href="/">
              <img src="/logo.svg" alt="Conduct Logo" className="w-32 md:w-40 mx-auto mb-8 cursor-pointer hover:opacity-80 transition-opacity" />
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-6">
            Thank You!
          </h1>
          <p className="text-[#4A4A4A] text-lg md:text-xl mb-10 leading-relaxed">
            We&apos;ve received your information and will calculate your Conduct Risk Score. You&apos;ll receive your score via email shortly.
          </p>
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
              Step {currentStep} of 2
            </span>
            <span className="text-sm text-[#6F6F6F]">{Math.round((currentStep / 2) * 100)}%</span>
          </div>
          <div className="w-full bg-[#E5E5E5] rounded-full h-2">
            <div
              className="bg-[#1A1A1A] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Title */}
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-6 text-center">
          {currentStep === 1 ? "Business Information" : "Digital Presence & Operations"}
        </h1>

        {/* Form Fields */}
        <div className="space-y-6 mb-10">
          {currentStep === 1 && (
            <>
              <div className="space-y-2">
                <label className="block text-lg md:text-xl font-medium text-[#1A1A1A]">
                  Legal Business Name <span className="text-red-500">*</span>
                  <span className="text-sm font-normal text-[#6F6F6F] ml-2">(Exact spelling as on Articles of Incorporation)</span>
                </label>
                <input
                  type="text"
                  value={formData.legal_business_name}
                  onChange={(e) => handleInputChange('legal_business_name', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#1A1A1A] rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:ring-offset-2"
                  placeholder="Enter legal business name"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-lg md:text-xl font-medium text-[#1A1A1A]">
                  Doing Business As (DBA)
                  <span className="text-sm font-normal text-[#6F6F6F] ml-2">(If you operate under a trade name)</span>
                </label>
                <input
                  type="text"
                  value={formData.doing_business_as}
                  onChange={(e) => handleInputChange('doing_business_as', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#1A1A1A] rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:ring-offset-2"
                  placeholder="Enter DBA if applicable"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-lg md:text-xl font-medium text-[#1A1A1A]">
                    State of Incorporation <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.state_of_incorporation}
                    onChange={(e) => handleInputChange('state_of_incorporation', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#1A1A1A] rounded-lg text-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:ring-offset-2"
                  >
                    <option value="">Select state</option>
                    <option value="AL">Alabama</option>
                    <option value="AK">Alaska</option>
                    <option value="AZ">Arizona</option>
                    <option value="AR">Arkansas</option>
                    <option value="CA">California</option>
                    <option value="CO">Colorado</option>
                    <option value="CT">Connecticut</option>
                    <option value="DE">Delaware</option>
                    <option value="FL">Florida</option>
                    <option value="GA">Georgia</option>
                    <option value="HI">Hawaii</option>
                    <option value="ID">Idaho</option>
                    <option value="IL">Illinois</option>
                    <option value="IN">Indiana</option>
                    <option value="IA">Iowa</option>
                    <option value="KS">Kansas</option>
                    <option value="KY">Kentucky</option>
                    <option value="LA">Louisiana</option>
                    <option value="ME">Maine</option>
                    <option value="MD">Maryland</option>
                    <option value="MA">Massachusetts</option>
                    <option value="MI">Michigan</option>
                    <option value="MN">Minnesota</option>
                    <option value="MS">Mississippi</option>
                    <option value="MO">Missouri</option>
                    <option value="MT">Montana</option>
                    <option value="NE">Nebraska</option>
                    <option value="NV">Nevada</option>
                    <option value="NH">New Hampshire</option>
                    <option value="NJ">New Jersey</option>
                    <option value="NM">New Mexico</option>
                    <option value="NY">New York</option>
                    <option value="NC">North Carolina</option>
                    <option value="ND">North Dakota</option>
                    <option value="OH">Ohio</option>
                    <option value="OK">Oklahoma</option>
                    <option value="OR">Oregon</option>
                    <option value="PA">Pennsylvania</option>
                    <option value="RI">Rhode Island</option>
                    <option value="SC">South Carolina</option>
                    <option value="SD">South Dakota</option>
                    <option value="TN">Tennessee</option>
                    <option value="TX">Texas</option>
                    <option value="UT">Utah</option>
                    <option value="VT">Vermont</option>
                    <option value="VA">Virginia</option>
                    <option value="WA">Washington</option>
                    <option value="WV">West Virginia</option>
                    <option value="WI">Wisconsin</option>
                    <option value="WY">Wyoming</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-lg md:text-xl font-medium text-[#1A1A1A]">
                    Entity Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.entity_type}
                    onChange={(e) => handleInputChange('entity_type', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#1A1A1A] rounded-lg text-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:ring-offset-2"
                  >
                    <option value="">Select entity type</option>
                    <option value="LLC">LLC</option>
                    <option value="C-Corp">C-Corp</option>
                    <option value="S-Corp">S-Corp</option>
                    <option value="Sole Prop">Sole Proprietorship</option>
                    <option value="Partnership">Partnership</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-lg md:text-xl font-medium text-[#1A1A1A]">
                  EIN (Federal Tax ID) <span className="text-red-500">*</span>
                  <span className="text-sm font-normal text-[#6F6F6F] ml-2">(Format: XX-XXXXXXX)</span>
                </label>
                <input
                  type="text"
                  value={formData.ein}
                  onChange={(e) => handleInputChange('ein', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#1A1A1A] rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:ring-offset-2"
                  placeholder="XX-XXXXXXX"
                  maxLength={10}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-lg md:text-xl font-medium text-[#1A1A1A]">
                  Business Physical Address <span className="text-red-500">*</span>
                  <span className="text-sm font-normal text-[#6F6F6F] ml-2">(Cannot be a P.O. Box)</span>
                </label>
                <input
                  type="text"
                  value={formData.business_physical_address}
                  onChange={(e) => handleInputChange('business_physical_address', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#1A1A1A] rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:ring-offset-2"
                  placeholder="Enter physical business address"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-lg md:text-xl font-medium text-[#1A1A1A]">
                  Date of Formation <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date_of_formation}
                  onChange={(e) => handleInputChange('date_of_formation', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#1A1A1A] rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:ring-offset-2"
                />
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="mb-6 p-4 bg-[#F5F5F5] rounded-lg">
                <p className="text-lg text-[#4A4A4A]">
                  Help us verify your business&apos;s digital presence and operational consistency. This information helps us build your proprietary Conduct Risk Score.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-lg md:text-xl font-medium text-[#1A1A1A]">
                  Corporate Website URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.corporate_website_url}
                  onChange={(e) => handleInputChange('corporate_website_url', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#1A1A1A] rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:ring-offset-2"
                  placeholder="https://www.example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-lg md:text-xl font-medium text-[#1A1A1A]">
                  LinkedIn Company Page URL
                </label>
                <input
                  type="url"
                  value={formData.linkedin_company_page_url}
                  onChange={(e) => handleInputChange('linkedin_company_page_url', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#1A1A1A] rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:ring-offset-2"
                  placeholder="https://www.linkedin.com/company/example"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-lg md:text-xl font-medium text-[#1A1A1A]">
                  Facebook Business Page URL
                </label>
                <input
                  type="url"
                  value={formData.facebook_business_page_url}
                  onChange={(e) => handleInputChange('facebook_business_page_url', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#1A1A1A] rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:ring-offset-2"
                  placeholder="https://www.facebook.com/example"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-lg md:text-xl font-medium text-[#1A1A1A]">
                  Yelp / Google Business Profile URL
                </label>
                <input
                  type="url"
                  value={formData.yelp_google_business_profile_url}
                  onChange={(e) => handleInputChange('yelp_google_business_profile_url', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#1A1A1A] rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:ring-offset-2"
                  placeholder="https://www.yelp.com/biz/example or https://www.google.com/maps/place/example"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-lg md:text-xl font-medium text-[#1A1A1A]">
                  Business Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.business_phone_number}
                  onChange={(e) => handleInputChange('business_phone_number', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#1A1A1A] rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:ring-offset-2"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-lg md:text-xl font-medium text-[#1A1A1A]">
                  Primary Bank Account (Last 4 digits only)
                </label>
                <input
                  type="text"
                  value={formData.primary_bank_account_last_4}
                  onChange={(e) => handleInputChange('primary_bank_account_last_4', e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full px-4 py-3 border-2 border-[#1A1A1A] rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:ring-offset-2"
                  placeholder="1234"
                  maxLength={4}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-lg md:text-xl font-medium text-[#1A1A1A]">
                  Email Address <span className="text-red-500">*</span>
                  <span className="text-sm font-normal text-[#6F6F6F] ml-2">(For receiving your risk score)</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#1A1A1A] rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:ring-offset-2"
                  placeholder="your@email.com"
                />
              </div>
            </>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-8 border-t border-[#E5E5E5]">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg text-lg font-medium transition-colors duration-200 ${
              currentStep === 1
                ? "text-[#6F6F6F] cursor-not-allowed"
                : "text-[#1A1A1A] hover:text-[#4A4A4A]"
            }`}
          >
            ← Previous
          </button>

          {currentStep < 2 ? (
            <button
              onClick={handleNext}
              disabled={!isStepComplete(currentStep)}
              className={`px-8 py-3 rounded-lg text-lg font-medium transition-colors duration-200 ${
                isStepComplete(currentStep)
                  ? "bg-[#1A1A1A] text-white hover:bg-[#333333]"
                  : "bg-[#E5E5E5] text-[#6F6F6F] cursor-not-allowed"
              }`}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isStepComplete(currentStep) || isSubmitting}
              className={`px-8 py-3 rounded-lg text-lg font-medium transition-colors duration-200 ${
                isStepComplete(currentStep) && !isSubmitting
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

