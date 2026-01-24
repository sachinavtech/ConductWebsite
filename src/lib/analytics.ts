/**
 * Analytics utility for Google Tag Manager and GA4
 * All tracking is event-based using window.dataLayer.push
 * No PII (Personally Identifiable Information) is sent to analytics
 */

// Anonymous user ID storage key
const ANONYMOUS_USER_ID_KEY = 'conduct_anonymous_user_id';

/**
 * Generate a random anonymous user ID
 */
function generateAnonymousUserId(): string {
  // Generate a UUID-like string without using crypto.randomUUID for broader compatibility
  return 'anon_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 15);
}

/**
 * Get or create an anonymous user ID
 * Persists in localStorage for consistency across reloads
 */
export function getAnonymousUserId(): string {
  if (typeof window === 'undefined') {
    return 'server_side';
  }

  try {
    let userId = localStorage.getItem(ANONYMOUS_USER_ID_KEY);
    
    if (!userId) {
      userId = generateAnonymousUserId();
      localStorage.setItem(ANONYMOUS_USER_ID_KEY, userId);
    }
    
    return userId;
  } catch {
    // Fallback if localStorage is not available
    console.warn('localStorage not available, using session-based ID');
    return generateAnonymousUserId();
  }
}

/**
 * Check if dataLayer is available (GTM loaded)
 */
function isDataLayerAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.dataLayer !== 'undefined';
}

/**
 * Push event to dataLayer for GTM/GA4
 */
function pushToDataLayer(eventData: Record<string, string | number | boolean | undefined>): void {
  if (!isDataLayerAvailable()) {
    console.warn('dataLayer not available, event not tracked:', eventData);
    return;
  }

  window.dataLayer.push({
    ...eventData,
    anonymous_user_id: getAnonymousUserId(),
    timestamp: new Date().toISOString(),
  });
}

/**
 * Extract non-PII attributes from questionnaire answers
 */
function extractNonPIIAttributes(answers: Record<string, string | string[] | undefined>): {
  revenue_bucket?: string;
  business_type?: string;
  recommended_product?: string;
} {
  const attributes: {
    revenue_bucket?: string;
    business_type?: string;
    recommended_product?: string;
  } = {};

  // Extract revenue bucket (non-PII)
  const revenueValue = answers.revenue_3months;
  if (revenueValue && typeof revenueValue === 'string') {
    attributes.revenue_bucket = revenueValue;
  }

  // Extract business type (non-PII)
  const businessModelValue = answers.business_model;
  if (businessModelValue && typeof businessModelValue === 'string') {
    attributes.business_type = businessModelValue;
  }

  // Extract recommended product if available (non-PII)
  const recommendedProductValue = answers.recommended_product;
  if (recommendedProductValue && typeof recommendedProductValue === 'string') {
    attributes.recommended_product = recommendedProductValue;
  }

  return attributes;
}

/**
 * Track prequalification start event
 */
export function trackPrequalStart(): void {
  pushToDataLayer({
    event: 'prequal_start',
    event_category: 'questionnaire',
    event_label: 'questionnaire_started',
  });
}

/**
 * Track questionnaire step completion
 */
export function trackStepCompletion(stepNumber: number, sectionName: string): void {
  pushToDataLayer({
    event: 'prequal_step_complete',
    event_category: 'questionnaire',
    event_label: `step_${stepNumber}_complete`,
    step_number: stepNumber,
    section_name: sectionName,
  });
}

/**
 * Track questionnaire completion
 */
export function trackCompletion(answers: Record<string, string | string[] | undefined>): void {
  const attributes = extractNonPIIAttributes(answers);
  
  pushToDataLayer({
    event: 'prequal_complete',
    event_category: 'questionnaire',
    event_label: 'questionnaire_completed',
    ...attributes,
  });
}

/**
 * Track routing result (recommendation provided)
 */
export function trackRoutingResult(
  recommendedProduct: string,
  revenueBucket?: string,
  businessType?: string
): void {
  pushToDataLayer({
    event: 'prequal_routing_result',
    event_category: 'questionnaire',
    event_label: 'routing_result_provided',
    recommended_product: recommendedProduct,
    revenue_bucket: revenueBucket,
    business_type: businessType,
  });
}

/**
 * Track lender click (when user clicks on a lender recommendation)
 */
export function trackLenderClick(lenderName: string, productType: string): void {
  pushToDataLayer({
    event: 'lender_click',
    event_category: 'engagement',
    event_label: 'lender_clicked',
    lender_name: lenderName,
    product_type: productType,
  });
}

/**
 * Track page view (for consistency)
 */
export function trackPageView(pagePath: string, pageTitle?: string): void {
  pushToDataLayer({
    event: 'page_view',
    event_category: 'navigation',
    page_path: pagePath,
    page_title: pageTitle || pagePath,
  });
}

/**
 * Initialize analytics (call on app load)
 * Ensures events are fired consistently across reloads
 */
export function initializeAnalytics(): void {
  if (typeof window === 'undefined') return;

  // Ensure anonymous user ID is generated
  getAnonymousUserId();

  // Track initial page view
  trackPageView(window.location.pathname);

  // Listen for route changes (Next.js)
  if (typeof window.history !== 'undefined') {
    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      trackPageView(window.location.pathname);
    };

    window.addEventListener('popstate', () => {
      trackPageView(window.location.pathname);
    });
  }
}

