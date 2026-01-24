# How to Verify GA4 Tag is Set Up and Firing

## The Problem: No "collect" or "gtag" Requests

If you don't see `collect` or `gtag` requests in the Network tab, it means:
- GA4 isn't initialized
- The GA4 Configuration tag isn't firing
- The tag might not be set up correctly in GTM

## Step-by-Step: Verify GA4 Tag in GTM

### Step 1: Check if GA4 Configuration Tag Exists

1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Select your container (GTM-K6NLW6KG)
3. Click **Tags** in the left sidebar
4. Look for a tag named something like:
   - "GA4 - Configuration"
   - "GA4 Config"
   - "Google Analytics: GA4 Configuration"
   - Or a Custom HTML tag with GA4 code

**If you don't see any GA4 tag:**
- You need to create one (see Step 2)

**If you see a GA4 tag:**
- Click on it to verify it's configured correctly (see Step 3)

### Step 2: Create GA4 Configuration Tag (If Missing)

If you don't have a GA4 Configuration tag, create one:

**Option A: Using Custom HTML (Recommended - Always Works)**

1. In GTM, click **Tags** > **New**
2. **Tag Name**: "GA4 - Configuration"
3. Click "Choose a tag type" > Select **Custom HTML**
4. **HTML** field, paste this (replace `G-XXXXXXXXXX` with your actual Measurement ID):
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```
5. **Triggering**: Select **All Pages**
6. Click **Save**

**Option B: Using GA4 Event Tag (If Available)**

1. In GTM, click **Tags** > **New**
2. **Tag Name**: "GA4 - Configuration"
3. Click "Choose a tag type" > Select **Google Analytics: GA4 Event**
4. Look for **Configuration Tag** section
5. Click **+** to create a new configuration tag:
   - **Tag Name**: "GA4 Config"
   - **Measurement ID**: Paste your `G-XXXXXXXXXX`
   - Click **Save**
6. Select this configuration tag from dropdown
7. **Event Name**: Leave empty or set to `page_view`
8. **Triggering**: Select **All Pages**
9. Click **Save**

### Step 3: Verify Tag Configuration

Click on your GA4 tag to edit it, and verify:

1. **Measurement ID** is correct:
   - Format: `G-XXXXXXXXXX` (starts with G-)
   - Get it from: Google Analytics > Admin > Data Streams
   - Must match exactly

2. **Trigger** is set:
   - Should be "All Pages"
   - If not, click trigger box and select "All Pages"

3. **Tag is not paused**:
   - Should not have a pause icon
   - If paused, click to unpause

### Step 4: Publish the Tag

**CRITICAL:** Tags only fire when published!

1. In GTM, check top right corner
2. If you see **"Submit"** button:
   - Click **Submit**
   - Add version name: "GA4 Configuration setup"
   - Add description: "Added GA4 Configuration tag"
   - Click **Publish**
3. After publishing, the tag will be live

### Step 5: Test if Tag is Firing

**Method A: GTM Preview Mode**

1. In GTM, click **Preview** button
2. Enter your website URL: `http://localhost:3000`
3. In the preview panel:
   - Go to **Tags** tab
   - Look for your GA4 Configuration tag
   - It should show **"Fired"** with green checkmark ✓
4. If it shows "Not Fired", the tag isn't triggering

**Method B: Browser DevTools**

1. Open your website
2. Open DevTools (F12) > **Console** tab
3. Type: `window.dataLayer` and press Enter
4. You should see an array
5. Look for objects with `event: 'gtm.load'` or similar
6. Type: `gtag` and press Enter
7. If you see a function definition, GA4 is loaded
8. If you see `undefined`, GA4 isn't loading

**Method C: Check Network Tab for GA4 Script**

1. Open DevTools > **Network** tab
2. Refresh the page
3. Look for: `gtag/js?id=G-XXXXXXXXXX`
4. If you see this request with status 200, GA4 script is loading
5. After the script loads, you should see `collect` requests

### Step 6: Verify Collect Requests Appear

After the GA4 tag fires, you should see:

1. In Network tab, filter by: `collect`
2. You should see requests to:
   - `google-analytics.com/g/collect`
   - Or `analytics.google.com/g/collect`
3. These requests should have:
   - Status: `200` or `204`
   - Type: `xhr` or `fetch`
4. Click on a request to see details:
   - Should have your Measurement ID in the URL
   - Should have event data in the payload

## Common Issues

### Issue: "I created the tag but still no collect requests"

**Check:**
- Is the tag published? (Not just saved)
- Is the Measurement ID correct?
- Does the tag have "All Pages" trigger?
- Did you refresh the website after publishing?

### Issue: "Tag shows as Fired in Preview but no collect requests"

**Check:**
- Is the Measurement ID correct in the tag?
- Are you testing on the actual website (not just preview)?
- Check browser console for JavaScript errors
- Try incognito mode (ad blockers might block it)

### Issue: "I see gtag/js loading but no collect requests"

**This means:**
- GA4 script is loading but not initializing
- Check if Measurement ID is correct
- Check browser console for errors
- Verify the `gtag('config', 'G-XXXXXXXXXX')` call is happening

## Quick Diagnostic Commands

Open browser Console (F12 > Console) and run:

```javascript
// Check if dataLayer exists
window.dataLayer

// Check if gtag function exists
typeof gtag

// Check if GA4 is configured (should show your Measurement ID)
window.dataLayer.find(item => item[0] === 'config')
```

## Still Not Working?

If after all these steps you still don't see collect requests:

1. **Verify Measurement ID:**
   - Go to GA4 > Admin > Data Streams
   - Copy the exact Measurement ID
   - Make sure it's `G-XXXXXXXXXX` format (not `GTM-XXXXXXX`)

2. **Check GTM Container:**
   - Make sure you're editing the correct GTM container
   - Container ID should be `GTM-K6NLW6KG`

3. **Test with a simple tag:**
   - Create a Custom HTML tag: `<script>console.log('Test');</script>`
   - Set trigger to "All Pages"
   - Publish
   - Check browser console for "Test" message
   - If you see it, GTM is working, issue is with GA4 tag specifically

4. **Check for errors:**
   - Browser console for JavaScript errors
   - Network tab for failed requests (red status codes)
   - GTM Preview for tag errors

