import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/Analytics";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Conduct Finance - Embedded Credit Layer for B2B Commerce",
  description:
    "Conduct delivers an embedded credit layer for B2B commerce. Launch net terms, automated underwriting, and servicing in weeks with a single platform.",
  keywords:
    "embedded credit, B2B commerce financing, net terms automation, credit infrastructure, underwriting API, embedded lending, trade credit, B2B marketplaces, credit decisioning",
  authors: [{ name: "Conduct Team" }],
  creator: "Conduct",
  publisher: "Conduct",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://conductfinance.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Conduct Finance - Embedded Credit Layer for B2B Commerce",
    description:
      "Conduct delivers an embedded credit layer for B2B commerce. Launch net terms, automated underwriting, and servicing in weeks with a single platform.",
    url: "https://conductfinance.com",
    siteName: "Conduct",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Conduct Finance - Embedded Credit Layer for B2B Commerce",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Conduct Finance - Embedded Credit Layer for B2B Commerce",
    description:
      "Conduct delivers an embedded credit layer for B2B commerce. Launch net terms, automated underwriting, and servicing in weeks with a single platform.",
    images: ["/twitter-image.jpg"],
    creator: "@conductfinance",
    site: "@conductfinance",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  category: "business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* App Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#121212" />
        <meta name="msapplication-TileColor" content="#121212" />
        <meta name="theme-color" content="#121212" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch for common external resources */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
            `,
          }}
        />
        {/* GTM Container ID - Replace GTM-XXXXXXX with your actual GTM container ID */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <script
            async
            src={`https://www.googletagmanager.com/gtm.js?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
          />
        )}
        
        {/* Security Headers */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        
        {/* Structured Data for Company */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Conduct",
              "url": "https://conductfinance.com",
              "logo": "https://conductfinance.com/logo.png",
              "description":
                "Conduct delivers an embedded credit layer for B2B commerce, enabling marketplaces, distributors, and SaaS platforms to offer flexible terms with automated underwriting.",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "123 Main Street",
                "addressLocality": "San Francisco",
                "addressRegion": "CA",
                "postalCode": "94101",
                "addressCountry": "USA"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-415-555-1234",
                "contactType": "partnerships",
                "email": "founders@conductfinance.com"
              },
              "sameAs": [
                "https://www.linkedin.com/company/conductfinance",
                "https://twitter.com/conductfinance",
                "https://www.facebook.com/conductfinance"
              ]
            })
          }}
        />
        
        {/* Additional Meta Tags */}
        <meta name="application-name" content="Conduct" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Conduct" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Performance Optimization - Removed font preload to avoid unused resource warning */}
      </head>
      <body className={`${inter.variable} antialiased`}>
        {/* Google Tag Manager (noscript) */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        
        <Analytics />
        <div className="min-h-screen flex flex-col">
          <div className="flex-1">{children}</div>
          <footer className="border-t border-[#E5E5E5]">
            <div className="max-w-5xl mx-auto px-6 py-8 text-center">
              <p className="text-[#4A4A4A] text-sm">© 2026 Conduct Finance Inc. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
