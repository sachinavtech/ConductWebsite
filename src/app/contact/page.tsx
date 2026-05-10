"use client";

import { useState } from "react";
import Link from "next/link";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
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
    return !!(formData.name && formData.email && formData.subject && formData.message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/contact/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
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
              Message Sent!
            </h1>
            <p className="text-[#2A3E66] text-lg md:text-xl mb-10 leading-relaxed">
              Thanks for reaching out. We&apos;ll get back to you as soon as possible.
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
            Talk to the Team
          </h1>
          <p className="text-[#2A3E66] text-lg md:text-xl leading-relaxed">
            Have a question about Business Cash Advance funding or want to learn more? Send us a message and we&apos;ll be in touch.
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
                placeholder="Your name"
                required
              />
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
                placeholder="you@example.com"
                required
              />
            </div>
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
              placeholder="What can we help you with?"
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
              placeholder="Tell us what you'd like to know..."
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
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
        </div>
      </section>
    </main>
  );
}
