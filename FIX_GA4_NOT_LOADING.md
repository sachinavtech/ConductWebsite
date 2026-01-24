# Fix: GA4 Script Not Loading (No gtag/js in Network Tab)

## The Problem

If you don't see `gtag/js?id=G-XXXXXXXXXX` in the Network tab, it means:
- The GA4 Configuration tag doesn't exist in GTM, OR
- The tag exists but isn't published, OR
- The tag exists but isn't firing (wrong trigger, paused, etc.)

## Step-by-Step Fix

### Step 1: Verify GTM is Loading

First, make sure GTM itself is working:

1. Open your website
2. Open DevTools > Network tab
3. Refresh the page
4. Look for: `gtm.js?id=GTM-K6NLW6KG`
5. Status should be `200`

**If you don't see `gtm.js`:**
- GTM isn't loading at all
- Check your `.env.local` has `NEXT_PUBLIC_GTM_ID=GTM-K6NLW6KG`
- Restart your dev server

**If you see `gtm.js` but no `gtag/js`:**
- GTM is loading, but GA4 tag isn't set up
- Continue to Step 2

### Step 2: Check if GA4 Tag Exists in GTM

1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Select your container (GTM-K6NLW6KG)
3. Click **Tags** in left sidebar
4. Look for a tag with "GA4" in the name

**If you see a GA4 tag:**
- Go to Step 3 to verify it's configured correctly

**If you DON'T see a GA4 tag:**
- Go to Step 4 to create one

### Step 3: Verify Existing GA4 Tag

If you found a GA4 tag, click on it to edit:

**Check these things:**

1. **Measurement ID is set:**
   - Should have a value like `G-XXXXXXXXXX`
   - Get it from: Google Analytics > Admin > Data Streams
   - Must match exactly

2. **Trigger is set:**
   - Should be "All Pages"
   - If empty or wrong, fix it

3. **Tag is not paused:**
   - Should not have a pause icon
   - If paused, unpause it

4. **Tag is published:**
   - Check top right of GTM
   - If you see "Submit" button, you need to publish
   - Click Submit > Publish

### Step 4: Create GA4 Configuration Tag

If you don't have a GA4 tag, create one:

**Method: Custom HTML (Recommended)**

1. In GTM, click **Tags** > **New**
2. **Tag Name**: "GA4 - Configuration"
3. Click "Choose a tag type" > Select **Custom HTML**
4. **HTML** field, paste this code:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**IMPORTANT:** Replace `G-XXXXXXXXXX` with your actual GA4 Measurement ID in BOTH places!

**To get your Measurement ID:**
1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (gear icon)
3. Click **Data Streams**
4. Click on your web data stream
5. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

5. **Triggering**: Click trigger box > Select **All Pages**
   - If "All Pages" doesn't exist, create it:
     - Click **+** button
     - Name: "All Pages"
     - Type: **Page View**
     - Fires on: **All Pages**
     - Click **Save**

6. Click **Save** (on the tag)

### Step 5: Publish the Tag

**CRITICAL:** Tags only work when published!

1. In GTM top right, click **Submit** button
2. **Version Name**: "GA4 Configuration setup"
3. **Version Description**: "Added GA4 Configuration tag"
4. Click **Publish** button
5. You should see "Version X published successfully"

### Step 6: Test on Your Website

After publishing:

1. **Refresh your website** (important!)
2. Open DevTools > **Network** tab
3. **Clear the network log** (click 🚫 icon)
4. **Refresh the page** again
5. **Filter by**: `gtag`
6. You should now see:
   - `gtag/js?id=G-XXXXXXXXXX` (GA4 script loading)
   - Status: `200`

### Step 7: Verify GA4 is Working

After you see `gtag/js` loading:

1. In Network tab, filter by: `collect`
2. You should see requests to:
   - `google-analytics.com/g/collect`
   - Status: `200` or `204`
3. This means GA4 is sending data!

## Quick Diagnostic

Run this in browser Console (F12 > Console):

```javascript
// Check if GTM loaded
window.dataLayer ? "GTM loaded ✓" : "GTM not loaded ✗"

// Check if GA4 loaded
typeof gtag === 'function' ? "GA4 loaded ✓" : "GA4 not loaded ✗"

// Check dataLayer contents
window.dataLayer
```

## Common Issues

### Issue: "I created the tag but still no gtag/js"

**Check:**
- Did you click **Publish** (not just Save)?
- Did you refresh your website after publishing?
- Is the Measurement ID correct?
- Does the tag have "All Pages" trigger?

### Issue: "I see gtag/js but no collect requests"

**This means:**
- GA4 script is loading ✓
- But GA4 isn't initializing
- Check if Measurement ID is correct
- Check browser console for errors

### Issue: "Tag shows as Fired in Preview but no gtag/js on website"

**This means:**
- Tag is configured correctly
- But it's not actually firing on your website
- Make sure tag is **published** (not just in preview mode)
- Refresh your website after publishing

## Checklist

Before expecting to see `gtag/js`:

- [ ] GTM is loading (`gtm.js` appears in Network tab)
- [ ] GA4 Configuration tag exists in GTM
- [ ] Tag has correct Measurement ID (`G-XXXXXXXXXX`)
- [ ] Tag has "All Pages" trigger
- [ ] Tag is **published** (not just saved)
- [ ] Website was refreshed after publishing
- [ ] No ad blockers interfering

## Still Not Working?

If after all these steps you still don't see `gtag/js`:

1. **Double-check Measurement ID:**
   - Go to GA4 > Admin > Data Streams
   - Copy the exact Measurement ID
   - Make sure it's `G-XXXXXXXXXX` format (not `GTM-XXXXXXX`)

2. **Test with GTM Preview:**
   - In GTM, click **Preview**
   - Enter your website URL
   - Check if GA4 tag shows as "Fired"
   - If it shows "Not Fired", check triggers

3. **Check for errors:**
   - Browser console for JavaScript errors
   - GTM Preview for tag errors
   - Network tab for failed requests (red status)

4. **Verify environment variable:**
   - Check `.env.local` has `NEXT_PUBLIC_GTM_ID=GTM-K6NLW6KG`
   - Restart dev server: `npm run dev`

