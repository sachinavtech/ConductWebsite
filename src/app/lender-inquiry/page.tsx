"use client";

import { useState } from "react";
import Link from "next/link";
import { messageFromPossibleJsonHtmlError, parseFetchJson } from "@/lib/parseFetchJson";

export default function LenderInquiry() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return !!(formData.name && formData.company && formData.email && formData.subject && formData.message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/lender-inquiry/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await parseFetchJson<{ error?: string }>(response);

      if (!response.ok) {
        throw new Error(data.error || "Failed to send inquiry");
      }

      setSubmitted(true);
    } catch (err) {
      setError(messageFromPossibleJsonHtmlError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-white text-[#0B3D91]">
        <header className="w-full flex justify-start pt-4 pl-4 md:pt-6 md:pl-6">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="Conduct Logo" className="w-40 md:w-48" />
          </Link>
        </header>
        <section className="flex items-center justify-center py-12">
          <div className="text-center max-w-2xl mx-auto px-6">
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-6">
              Thank You!
            </h1>
            <p className="text-[#2A3E66] text-lg md:text-xl mb-10 leading-relaxed">
              We&apos;ve received your inquiry and will get back to you shortly. We&apos;re excited to explore how we can work together.
            </p>
            <Link
              href="/"
              className="inline-block bg-[#0B3D91] text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#0A2F72] transition-colors duration-200"
            >
              Back to Home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#0B3D91]">
      <header className="w-full flex justify-start pt-4 pl-4 md:pt-6 md:pl-6">
        <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
          <img src="/logo.svg" alt="Conduct Logo" className="w-40 md:w-48" />
        </Link>
      </header>
      <section className="flex items-center justify-center py-12">
        <div className="w-full max-w-2xl mx-auto px-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-4">
            Join Our Business Cash Advance Lender Network
          </h1>
          <p className="text-[#2A3E66] text-lg md:text-xl leading-relaxed">
            Integrate our scoring engine into your underwriting workflow or receive pre-scored Business Cash Advance leads directly to your CRM.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-lg font-medium text-[#0B3D91]">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#0B3D91] rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#0B3D91] focus:ring-offset-2"
                placeholder="John Smith"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-medium text-[#0B3D91]">
                Company <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#0B3D91] rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#0B3D91] focus:ring-offset-2"
                placeholder="Your company name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-lg font-medium text-[#0B3D91]">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#0B3D91] rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#0B3D91] focus:ring-offset-2"
              placeholder="you@company.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-lg font-medium text-[#0B3D91]">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#0B3D91] rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#0B3D91] focus:ring-offset-2"
              placeholder="e.g. Interested in receiving pre-scored Business Cash Advance leads"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-lg font-medium text-[#0B3D91]">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border-2 border-[#0B3D91] rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#0B3D91] focus:ring-offset-2 resize-vertical"
              placeholder="Tell us about your company, what you're looking for, and how we can help..."
              required
            />
          </div>

          {error && (
            <div className="p-4 bg-[#FEF2F2] border-2 border-[#991B1B] rounded-lg">
              <p className="text-[#991B1B]">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!isFormValid() || isSubmitting}
            className={`w-full px-8 py-4 rounded-lg text-lg font-medium transition-colors duration-200 ${
              isFormValid() && !isSubmitting
                ? "bg-[#0B3D91] text-white hover:bg-[#0A2F72]"
                : "bg-[#E5E5E5] text-[#6F6F6F] cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "Sending..." : "Send Inquiry"}
          </button>
        </form>
        </div>
      </section>
    </main>
  );
}
