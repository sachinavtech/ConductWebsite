# Analytics Instrumentation Summary

## ✅ Every Page is Instrumented

All pages on your website are automatically tracked through the root layout (`src/app/layout.tsx`). The `Analytics` component tracks:

- **Page views** on every page load
- **Route changes** in Next.js (SPA navigation)
- **Anonymous user ID** persistence across sessions

## 📊 Current Tracking Implementation

### 1. **Homepage (`/`)**
- ✅ Page view tracked automatically
- ✅ "Start Questionnaire" button click → `prequal_start` event

### 2. **Questionnaire Page (`/questionnaire`)**
- ✅ Page view tracked automatically
- ✅ `prequal_start` event (when page loads)
- ✅ `prequal_step_complete` event (when user completes each section)
  - Includes: `step_number`, `section_name`
- ✅ `prequal_complete` event (when questionnaire is submitted)
  - Includes: `revenue_bucket`, `business_type`, `recommended_product`

### 3. **All Other Pages**
- ✅ Page view tracked automatically on load
- ✅ Page view tracked on route changes

## 🎯 Tracked Events

### Funnel Events

1. **`prequal_start`**
   - Fired: When user clicks "Start Questionnaire" or lands on `/questionnaire`
   - Parameters: `event_category: 'questionnaire'`

2. **`prequal_step_complete`**
   - Fired: When user completes a section and clicks "Next"
   - Parameters:
     - `step_number`: 1-5 (which section)
     - `section_name`: Name of the section
     - `event_category: 'questionnaire'`

3. **`prequal_complete`**
   - Fired: When questionnaire is successfully submitted
   - Parameters:
     - `revenue_bucket`: User's revenue range (non-PII)
     - `business_type`: User's business model (non-PII)
     - `recommended_product`: Product recommendation (if available)
     - `event_category: 'questionnaire'`

4. **`prequal_routing_result`**
   - Fired: When a routing result/recommendation is provided
   - Parameters: `recommended_product`, `revenue_bucket`, `business_type`

5. **`lender_click`**
   - Fired: When user clicks on a lender recommendation
   - Parameters: `lender_name`, `product_type`

6. **`page_view`**
   - Fired: On every page load and route change
   - Parameters: `page_path`, `page_title`

## 📈 Tracking Questionnaire Drop-Offs

### Current Capability

**Yes, you can track where users drop off!** Here's how:

### Method 1: Using Step Completion Events

In GA4, you can analyze the funnel:

1. Go to **Explore** > **Funnel Exploration**
2. Create a funnel with these steps:
   - Step 1: `prequal_start`
   - Step 2: `prequal_step_complete` (filter: `step_number = 1`)
   - Step 3: `prequal_step_complete` (filter: `step_number = 2`)
   - Step 4: `prequal_step_complete` (filter: `step_number = 3`)
   - Step 5: `prequal_step_complete` (filter: `step_number = 4`)
   - Step 6: `prequal_complete`

This shows:
- How many users start
- How many complete each step
- Where they drop off

### Method 2: Using Section Names

You can also analyze by section:

1. Go to **Explore** > **Free Form**
2. Add dimension: `section_name`
3. Add metric: `Event count`
4. Filter: `event = prequal_step_complete`
5. This shows which sections have the most completions/drop-offs

### Method 3: Abandonment Events (New!)

Track users who abandon:

1. Go to **Reports** > **Engagement** > **Events**
2. Filter by `prequal_abandon`
3. Add dimension: `last_section_name` or `last_step_number`
4. See:
   - Which sections have the most abandonments
   - Average time spent before abandoning
   - Drop-off rate by section

### Method 4: Time-Based Analysis

Track time spent on each section:

1. Go to **Explore** > **Path Exploration**
2. Start with `prequal_start`
3. See the user journey through sections
4. Identify where users exit

## 🔍 Drop-Off Tracking (Now Implemented!)

**Abandonment tracking is now active!** This tracks:

- ✅ When a user starts but never completes
- ✅ How long they spent before leaving
- ✅ Which section they were on when they left

**New Event: `prequal_abandon`**
- Fired: When user leaves the questionnaire without completing
- Parameters:
  - `last_step_number`: The step they were on when they left
  - `last_section_name`: The section name they were viewing
  - `time_spent_seconds`: How long they spent on the questionnaire

## 📊 How to View Drop-Off Data in GA4

### Option 1: Funnel Exploration (Best for Drop-Offs)

1. Go to GA4 > **Explore** > **Funnel Exploration**
2. Create a new exploration
3. Add steps:
   - `prequal_start`
   - `prequal_step_complete` (step_number = 1)
   - `prequal_step_complete` (step_number = 2)
   - `prequal_step_complete` (step_number = 3)
   - `prequal_step_complete` (step_number = 4)
   - `prequal_complete`
4. View the funnel to see drop-off rates at each step

### Option 2: Events Report

1. Go to GA4 > **Reports** > **Engagement** > **Events**
2. Filter by `prequal_step_complete`
3. Add dimension: `step_number`
4. See event counts for each step
5. Compare to `prequal_start` to calculate drop-off

### Option 3: Custom Report

1. Go to GA4 > **Explore** > **Free Form**
2. Dimensions:
   - `event_name`
   - `step_number` (for step completion events)
   - `section_name`
3. Metrics:
   - `Event count`
   - `Users`
4. Filter: `event_name contains 'prequal'`
5. This gives you a complete view of the questionnaire funnel

## 📋 Data Available for Analysis

### User Journey
- ✅ When they start the questionnaire
- ✅ Which sections they complete
- ✅ When they complete the questionnaire
- ✅ When they abandon (with last section and time spent)

### User Attributes (Non-PII)
- ✅ Revenue bucket
- ✅ Business type
- ✅ Recommended product

### Technical Data
- ✅ Anonymous user ID (persists across sessions)
- ✅ Timestamp for each event
- ✅ Page path for each interaction

## 🎯 Key Metrics You Can Track

1. **Conversion Rate**: `prequal_complete` / `prequal_start`
2. **Step Completion Rate**: Users completing step N / Users starting
3. **Drop-Off Rate**: Users who start but don't complete
4. **Average Steps Completed**: Average step_number for users who started
5. **Section Analysis**: Which sections have highest/lowest completion rates

## 🔐 Privacy Compliance

- ✅ No PII (Personally Identifiable Information) sent to analytics
- ✅ Anonymous user ID (not tied to personal data)
- ✅ Only business attributes (revenue, business type) included
- ✅ Email addresses never sent to analytics

## 📝 Summary

**Every page is instrumented:**
- ✅ Homepage
- ✅ Questionnaire page
- ✅ All other pages (automatic via layout)

**Questionnaire tracking:**
- ✅ Start event
- ✅ Step completion events (with step number and section name)
- ✅ Completion event
- ✅ Can track drop-offs using funnel analysis

**To track drop-offs:**
- Use GA4 Funnel Exploration to see where users drop off
- Analyze step completion events by step_number
- Compare start vs. completion rates

