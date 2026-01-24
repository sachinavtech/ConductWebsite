# Analytics Setup Guide

This website uses Google Tag Manager (GTM) and GA4 for event-based analytics tracking. All tracking is done via `window.dataLayer.push` and no PII (Personally Identifiable Information) is sent to analytics.

## Features

- ✅ Event-based tracking using `window.dataLayer.push`
- ✅ Anonymous user ID generation and persistence
- ✅ No PII sent to analytics
- ✅ Key funnel event tracking:
  - Prequal start
  - Step completion
  - Questionnaire completion
  - Routing result
  - Lender click
- ✅ Non-PII attributes attached (revenue bucket, business type, recommended product)
- ✅ Consistent event firing across reloads
- ✅ GTM hooks ready for GA4 and PostHog forwarding

## Setup Instructions

### 1. Get Your Google Tag Manager Container ID

1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Create a new container or select an existing one
3. Copy your Container ID (format: `GTM-XXXXXXX`)

### 2. Configure Environment Variables

Add your GTM Container ID to `.env.local`:

```bash
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

**Important:** Replace `GTM-XXXXXXX` with your actual GTM Container ID.

### 3. Configure GTM Tags

In your Google Tag Manager container, set up the following:

#### GA4 Configuration Tag - Step by Step

**Step 1: Get Your GA4 Measurement ID**

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (gear icon) in the bottom left
3. In the **Property** column, click **Data Streams**
4. Click on your web data stream (or create a new one if you don't have one)
5. Copy your **Measurement ID** (format: `G-XXXXXXXXXX`) - it will be displayed at the top of the page

**Step 2: Create the GA4 Configuration Tag in GTM**

1. Go back to [Google Tag Manager](https://tagmanager.google.com/)
2. Select your container (the one with the GTM ID you're using)
3. Make sure you're in the correct **Workspace** (usually "Default Workspace" - you'll see this in the top right)
4. In the left sidebar, click **Tags** (you should see a list of existing tags or an empty list)
5. Click the **New** button in the top right (or **+ Add a new tag** if you see that button)
6. You'll see a tag setup screen with:
   - **Tag Name** field at the top (you can name it later)
   - A large box that says "Choose a tag type to begin setup" - **Click this box**
7. A popup/modal will appear with tag types. Look for one of these options:

   **Option A: If you see "Google Analytics: GA4 Configuration"**
   - Click on **Google Analytics: GA4 Configuration**
   - Skip to Step 3 below

   **Option B: If you only see "Google Analytics: GA4 Event" (most common)**
   - **Don't use this for configuration** - GA4 Event is for tracking events, not initialization
   - Instead, use **Custom HTML** (see Option D below) OR look for "Configuration" in the left sidebar

   **Option C: If you see "Google Analytics" (older GTM versions)**
   - Click on **Google Analytics**
   - In the configuration, select **Google Analytics 4** as the type
   - Then follow the configuration steps

   **Option D: If you don't see any GA4 options**
   - Use **Custom HTML** tag type
   - We'll provide the code (see Step 3D below)

8. If you don't see it immediately, use the search box at the top of the popup and type "GA4" or "Google Analytics"

**Step 3: Configure the Tag**

The configuration depends on which tag type you selected:

### **If you selected "Google Analytics: GA4 Configuration" (Option A):**

1. **Tag Name** (at the top):
   - Change it to something descriptive like "GA4 - Configuration" or "GA4 Config"

2. **Measurement ID** field:
   - Paste your GA4 Measurement ID here (the `G-XXXXXXXXXX` you copied from Google Analytics)
   - It should look like: `G-ABC123XYZ`

3. **Triggering** section (scroll down):
   - Click in the trigger selection box
   - Select **All Pages** (or create it if it doesn't exist - see trigger creation steps below)

4. Click **Save** in the top right corner

### **Recommended: Use Custom HTML (Easiest & Always Works)**

Since you don't see "GA4 Configuration" tag type, use **Custom HTML** instead:

1. **Tag Name** (at the top):
   - Change it to "GA4 - Configuration" or "GA4 Config"

2. **HTML** field:
   - Paste this code (replace `G-XXXXXXXXXX` with your actual GA4 Measurement ID):
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```
   - **Important**: Replace both instances of `G-XXXXXXXXXX` with your actual Measurement ID
   - Example: If your ID is `G-ABC123XYZ`, the code should have `G-ABC123XYZ` in both places

3. **Triggering** section (scroll down):
   - Click in the trigger selection box
   - Select **All Pages** (or create it if it doesn't exist - see trigger creation steps below)

4. Click **Save** in the top right corner

**This Custom HTML tag will:**
- Load the GA4 JavaScript library
- Initialize GA4 with your Measurement ID
- Send page views automatically
- Work exactly like a GA4 Configuration tag

### **If you selected "Google Analytics" (Option C - Older GTM):**

1. **Tag Name**: "GA4 - Configuration"
2. **Tracking Type**: Select **Google Analytics 4**
3. **Measurement ID**: Paste your GA4 Measurement ID
4. **Triggering**: Select **All Pages**
5. Click **Save**

### **Alternative: Using GA4 Event with Configuration Tag**

If you prefer to use "Google Analytics: GA4 Event" and your GTM has a "Configuration" section:

1. **Tag Name**: "GA4 - Configuration"
2. Look for a **"Configuration Tag"** or **"Choose Configuration Tag"** section
3. Click **+** or **"Add new"** to create a configuration tag:
   - Name: "GA4 Config"
   - Measurement ID: Paste your `G-XXXXXXXXXX`
   - Save it
4. Select this configuration tag from the dropdown
5. **Event Name**: Leave empty or set to `page_view`
6. **Triggering**: Select **All Pages**
7. Click **Save**

**Note**: If you don't see a Configuration Tag option, use the Custom HTML method above instead.

### **Creating the "All Pages" Trigger (if it doesn't exist):**

If you need to create the "All Pages" trigger:

1. Click the **+** button in the trigger selection area
2. **Trigger Name**: Type "All Pages"
3. **Trigger Type**: Click the box and select **Page View**
4. **This trigger fires on**: Select **All Pages** (this should be the default)
5. Click **Save** in the top right
6. You'll be taken back to the tag configuration
7. Now select "All Pages" from the trigger dropdown

**Step 4: Verify the Tag**

1. After saving, you'll be taken back to the Tags list
2. You should now see your GA4 Configuration tag in the list
3. Verify it shows:
   - **Tag Name**: "GA4 - Configuration" (or whatever you named it)
   - **Tag Type**: Google Analytics: GA4 Configuration
   - **Triggering**: All Pages
   - **Status**: Will show as "Draft" until you publish (or "Active" if auto-published)

**What this tag does:**
- This tag initializes Google Analytics 4 on every page load
- It sends basic page view data to GA4
- It needs to be on "All Pages" so GA4 is loaded before your event tags fire

**Step 5: Test Before Publishing (Recommended)**

Before publishing, test that the tag works. There are several ways to test:

### **Method 1: GTM Preview Mode (If it works)**

1. In GTM, click the **Preview** button in the top right corner
2. A popup will ask for your website URL
3. Enter your website URL:
   - For local testing: `http://localhost:3000` (make sure your dev server is running!)
   - For production: `https://yourdomain.com`
4. Click **Connect**
5. Your website should open in a new tab/window with GTM Preview mode enabled
6. In the GTM Preview panel (usually at the bottom of the page), you should see:
   - **Container Loaded** message
   - **Tags** section showing your GA4 Configuration tag
   - The tag should show as **Fired** with a green checkmark ✓
   - Click on the tag to see details like Measurement ID, etc.

**If Preview Mode Times Out or Can't Connect:**

This is common with localhost. Try these solutions:

**Solution A: Use the GTM Preview Extension**
1. Install the [Google Tag Assistant Legacy Extension](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk) for Chrome
2. Or use the [Tag Assistant Companion](https://tagassistant.google.com/) 
3. Navigate to your website manually
4. The extension will show which tags are firing

**Solution B: Test in Browser DevTools (Easiest)**
1. Open your website in a browser (e.g., `http://localhost:3000`)
2. Open Browser DevTools (F12 or Right-click > Inspect)
3. Go to the **Console** tab
4. Type: `window.dataLayer` and press Enter
5. You should see an array with objects - this means GTM is loaded!
6. Check the **Network** tab:
   - Filter by "gtag" or "collect"
   - Refresh the page
   - You should see requests to `google-analytics.com/g/collect` or `googletagmanager.com/gtag/js`
   - This confirms GA4 is loading and sending data

**Solution C: Check GTM Container is Loading**
1. Open your website
2. Open Browser DevTools > **Network** tab
3. Refresh the page
4. Look for a request to `googletagmanager.com/gtm.js?id=GTM-XXXXXXX`
5. If you see this request with status 200, GTM is loading correctly
6. If you see 404 or errors, check your `NEXT_PUBLIC_GTM_ID` in `.env.local`

**Solution D: Verify in Google Analytics Real-Time**
1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your GA4 property
3. Click **Reports** > **Real-time** (or go directly to Real-time)
4. Visit your website
5. You should see yourself as an active user within 30 seconds
6. This confirms GA4 is receiving data!

### **What to Check if Testing Fails:**

- ✅ Is your dev server running? (`npm run dev`)
- ✅ Is your GTM Container ID correct in `.env.local`? (format: `GTM-XXXXXXX`)
- ✅ Did you restart your dev server after adding `NEXT_PUBLIC_GTM_ID`?
- ✅ Are there any JavaScript errors in the browser console?
- ✅ Is the GTM script loading? (Check Network tab for `gtm.js` requests)
- ✅ Is your GA4 Measurement ID correct in the GTM tag? (format: `G-XXXXXXXXXX`)

**Step 6: Publish Your Changes**

Once you've tested and everything works:

1. In GTM, click the **Submit** button in the top right corner
2. You'll see a "Create Version" screen with:
   - **Version Name**: Enter something descriptive like "Initial GA4 setup" or "Added GA4 Configuration tag"
   - **Version Description** (optional): Add more details like "Set up GA4 Configuration tag to track all page views"
3. Click **Publish** button
4. You may see a confirmation dialog - click **Publish** again to confirm
5. Your GA4 Configuration tag is now live and will fire on all pages!

**Important Notes:**
- After publishing, it may take a few minutes for the changes to propagate
- You can verify it's working by checking Google Analytics Real-Time reports
- The tag will now fire on every page load across your site

#### Event Tags for Funnel Tracking

Create individual tags for each event type:

1. **Prequal Start**
   - Tag Type: Google Analytics: GA4 Event
   - Event Name: `prequal_start`
   - Trigger: Custom Event `prequal_start`

2. **Step Completion**
   - Tag Type: Google Analytics: GA4 Event
   - Event Name: `prequal_step_complete`
   - Trigger: Custom Event `prequal_step_complete`
   - Include event parameters: `step_number`, `section_name`

3. **Questionnaire Completion**
   - Tag Type: Google Analytics: GA4 Event
   - Event Name: `prequal_complete`
   - Trigger: Custom Event `prequal_complete`
   - Include event parameters: `revenue_bucket`, `business_type`, `recommended_product`

4. **Routing Result**
   - Tag Type: Google Analytics: GA4 Event
   - Event Name: `prequal_routing_result`
   - Trigger: Custom Event `prequal_routing_result`
   - Include event parameters: `recommended_product`, `revenue_bucket`, `business_type`

5. **Lender Click**
   - Tag Type: Google Analytics: GA4 Event
   - Event Name: `lender_click`
   - Trigger: Custom Event `lender_click`
   - Include event parameters: `lender_name`, `product_type`

#### PostHog Integration (Optional)

To forward events to PostHog:

1. Create a new **Custom HTML** tag
2. Add PostHog capture code:
   ```javascript
   <script>
     if (typeof posthog !== 'undefined') {
       posthog.capture('{{Event}}', {{Event Parameters}});
     }
   </script>
   ```
3. Set trigger to match the corresponding GTM event

### 4. Event Data Structure

All events pushed to `dataLayer` include:

```javascript
{
  event: 'event_name',
  event_category: 'category',
  event_label: 'label',
  anonymous_user_id: 'anon_...', // Generated on first load, persisted
  timestamp: '2024-01-01T00:00:00.000Z',
  // Additional event-specific parameters
}
```

### 5. Tracked Events

#### `prequal_start`
Fired when user clicks "Start Questionnaire" or lands on questionnaire page.

**Parameters:**
- `event`: `prequal_start`
- `event_category`: `questionnaire`
- `event_label`: `questionnaire_started`

#### `prequal_step_complete`
Fired when user completes a section and clicks "Next".

**Parameters:**
- `event`: `prequal_step_complete`
- `event_category`: `questionnaire`
- `event_label`: `step_{number}_complete`
- `step_number`: Number (1-5)
- `section_name`: String (section name)

#### `prequal_complete`
Fired when questionnaire is successfully submitted.

**Parameters:**
- `event`: `prequal_complete`
- `event_category`: `questionnaire`
- `event_label`: `questionnaire_completed`
- `revenue_bucket`: String (optional, non-PII)
- `business_type`: String (optional, non-PII)
- `recommended_product`: String (optional, non-PII)

#### `prequal_routing_result`
Fired when a routing result/recommendation is provided to the user.

**Parameters:**
- `event`: `prequal_routing_result`
- `event_category`: `questionnaire`
- `event_label`: `routing_result_provided`
- `recommended_product`: String
- `revenue_bucket`: String (optional)
- `business_type`: String (optional)

#### `lender_click`
Fired when user clicks on a lender recommendation.

**Parameters:**
- `event`: `lender_click`
- `event_category`: `engagement`
- `event_label`: `lender_clicked`
- `lender_name`: String
- `product_type`: String

#### `page_view`
Fired on page load and route changes.

**Parameters:**
- `event`: `page_view`
- `event_category`: `navigation`
- `page_path`: String
- `page_title`: String

## Anonymous User ID

- Generated on first page load
- Stored in `localStorage` with key `conduct_anonymous_user_id`
- Format: `anon_{timestamp}_{random}`
- Persists across page reloads and sessions
- No PII is included in the ID

## Non-PII Attributes

The following non-PII attributes are extracted from questionnaire answers and attached to events:

- **revenue_bucket**: From `revenue_3months` field (e.g., "no revenue", "< $25k/month")
- **business_type**: From `business_model` field (e.g., "B2B", "B2C")
- **recommended_product**: Product recommendation (when available)

## Testing

### Verify GTM is Loaded

1. Open browser DevTools
2. Check Console for any GTM errors
3. Verify `window.dataLayer` exists: `console.log(window.dataLayer)`

### Verify Events are Firing

1. Open browser DevTools > Network tab
2. Filter by "collect" or "gtm"
3. Complete the questionnaire
4. Verify events are being sent

### Test in GTM Preview Mode

**If Preview Mode Works:**
1. Go to GTM dashboard
2. Click "Preview" button
3. Enter your website URL
4. Complete the questionnaire
5. Verify events appear in GTM preview panel

**If Preview Mode Times Out (Common Issue):**

GTM Preview mode often times out with localhost, even if the website opens. Here's how to test without Preview mode:

**Method 1: Browser DevTools (Recommended)**
1. Open your website in a browser (make sure dev server is running: `npm run dev`)
2. Open DevTools (F12 or Right-click > Inspect)
3. Go to **Console** tab
4. Type: `window.dataLayer` and press Enter
5. You should see an array - this confirms GTM is loaded!
6. Complete the questionnaire
7. Type `window.dataLayer` again - you should see new event objects added to the array
8. Check **Network** tab:
   - Filter by "collect" or "gtag"
   - You should see requests to `google-analytics.com/g/collect` when events fire
   - This confirms events are being sent to GA4

**Method 2: Google Analytics Real-Time Reports**
1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your GA4 property
3. Click **Reports** > **Real-time** (or navigate directly to Real-time)
4. Visit your website and complete the questionnaire
5. Within 30-60 seconds, you should see:
   - Active users (yourself)
   - Events firing (prequal_start, prequal_step_complete, etc.)
6. This confirms everything is working!

**Method 3: Check GTM Container is Loading**
1. Open your website
2. Open DevTools > **Network** tab
3. Refresh the page
4. Look for a request to: `googletagmanager.com/gtm.js?id=GTM-XXXXXXX`
5. If you see this with status 200, GTM is loading correctly
6. If you see 404 or errors, check your `NEXT_PUBLIC_GTM_ID` in `.env.local`

**Why Preview Mode Times Out:**
- GTM Preview mode has trouble connecting to localhost URLs
- Popup blockers can interfere
- Browser security settings
- The website opens but GTM can't establish the connection

**Solution:** Use the methods above - they're actually more reliable for testing!

## Production Deployment

When deploying to Vercel or other platforms:

1. Add `NEXT_PUBLIC_GTM_ID` to your environment variables
2. Redeploy the application
3. Verify GTM container is loading in production

## Privacy Compliance

- ✅ No PII (email, name, address) is sent to analytics
- ✅ Anonymous user ID is generated client-side
- ✅ All tracking is opt-in via GTM consent mode (if configured)
- ✅ Events can be filtered/blocked via GTM

## Troubleshooting

### Events not appearing in GA4

1. Verify GTM Container ID is correct in `.env.local`
2. Check GTM container is published
3. Verify GA4 tags are configured in GTM
4. Check browser console for errors
5. Use GTM Preview mode to debug

### Anonymous User ID not persisting

- Check if localStorage is available in browser
- Verify no privacy extensions are blocking localStorage
- Check browser console for errors

### dataLayer not defined

- Ensure GTM script is loading (check Network tab)
- Verify `NEXT_PUBLIC_GTM_ID` is set
- Check for JavaScript errors blocking GTM load

## Quick Reference: GA4 Configuration Tag Setup

**TL;DR - Quick Steps (Using Custom HTML - Works Every Time):**

1. Get GA4 Measurement ID from Google Analytics (Admin > Data Streams)
2. In GTM: Tags > New > **Custom HTML**
3. Paste the HTML code (replace `G-XXXXXXXXXX` with your Measurement ID)
4. Set Trigger: All Pages
5. Save and Publish

**If you see "Google Analytics: GA4 Configuration" tag type:**
- Use that instead and just paste your Measurement ID

**What You Need:**
- GA4 Measurement ID (format: `G-XXXXXXXXXX`)
- GTM Container access
- Your website URL for testing

**Key Fields:**
- **Measurement ID**: Your GA4 property ID (from Google Analytics)
- **Trigger**: All Pages (fires on every page load)
- **Tag Name**: Something descriptive like "GA4 - Configuration"

**Common Mistakes to Avoid:**
- ❌ Using GTM Container ID instead of GA4 Measurement ID
- ❌ Forgetting to set the trigger to "All Pages"
- ❌ Not publishing after creating the tag
- ❌ Using Universal Analytics tag instead of GA4 Configuration tag

