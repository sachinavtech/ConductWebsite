"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initializeAnalytics, trackPageView } from "@/lib/analytics";

/**
 * Analytics component that initializes tracking and handles page views
 * This component should be included in the root layout
 */
export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize analytics on mount
    initializeAnalytics();
  }, []);

  useEffect(() => {
    // Track page view on route change
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

  return null;
}

