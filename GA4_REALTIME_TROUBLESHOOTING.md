# Troubleshooting: Not Seeing Visitors in GA4 Real-Time

## Quick Checklist

- [ ] GA4 Configuration tag is created in GTM
- [ ] GA4 Configuration tag is **published** (not just saved)
- [ ] GA4 Measurement ID is correct in the tag
- [ ] Tag has "All Pages" trigger
- [ ] GTM container is published
- [ ] You're looking at the correct GA4 property
- [ ] You're visiting the website after tags are published

## Step-by-Step Troubleshooting

### 1. Verify GA4 Configuration Tag is Published

**Most Common Issue:** Tags are saved but not published!

1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Check the top right corner:
   - If you see **"Submit"** button → You have unpublished changes
   - Click **Submit** → Add version name → Click **Publish**
3. After publishing, refresh your website and wait 30-60 seconds
4. Check GA4 Real-time again

### 2. Verify GA4 Configuration Tag is Set Up Correctly

1. In GTM, go to **Tags** section
2. Find your GA4 Configuration tag (or Custom HTML tag with GA4 code)
3. Click on it to edit
4. Verify:
   - **Measurement ID** is correct (format: `G-XXXXXXXXXX`)
   - **Trigger** is set to "All Pages"
   - Tag is **not paused/disabled**

### 3. Verify Measurement ID is Correct

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (gear icon) in bottom left
3. In **Property** column, click **Data Streams**
4. Click on your web data stream
5. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)
6. Go back to GTM and verify it matches exactly in your tag

### 4. Test if Tag is Firing

**Method A: GTM Preview Mode**
1. In GTM, click **Preview** button
2. Enter your website URL
3. In the preview panel, check **Tags** tab
4. Your GA4 Configuration tag should show as **Fired** (green checkmark)
5. If it shows "Not Fired", the tag isn't triggering

**Method B: Browser DevTools**
1. Open your website
2. Open DevTools (F12) > **Console** tab
3. Type: `window.dataLayer` and press Enter
4. You should see an array with objects
5. Look for objects with `event: 'gtm.load'` or similar
6. Check **Network** tab:
   - Filter by "collect" or "gtag"
   - You should see requests to `google-analytics.com/g/collect`
   - Status should be `200` or `204`

### 5. Verify You're Looking at the Right GA4 Property

1. In Google Analytics, check the property name in the top left
2. Make sure it matches the property where you set up the data stream
3. If you have multiple properties, you might be looking at the wrong one

### 6. Check for Browser Extensions

Ad blockers and privacy extensions can block GA4:

1. Try an **incognito/private window**
2. Or temporarily disable extensions:
   - Ad blockers (uBlock Origin, AdBlock Plus)
   - Privacy extensions (Privacy Badger, Ghostery)
   - VPN extensions

### 7. Verify GTM Container is Loading

1. Open your website
2. Open DevTools > **Network** tab
3. Refresh the page
4. Look for: `googletagmanager.com/gtm.js?id=GTM-XXXXXXX`
5. Status should be `200`
6. If you don't see this, GTM isn't loading

### 8. Check Environment Variable

Make sure your `.env.local` has:
```bash
NEXT_PUBLIC_GTM_ID=GTM-K6NLW6KG
```

Then restart your dev server:
```bash
# Stop server (Ctrl+C)
npm run dev
```

### 9. Real-Time Reporting Delay

GA4 Real-time can take 30-60 seconds to show data:

1. Visit your website
2. Wait 30-60 seconds
3. Refresh the GA4 Real-time page
4. You should see yourself as an active user

### 10. Verify GA4 Tag is Actually Sending Data

1. Open your website
2. Open DevTools > **Network** tab
3. Filter by: `collect` or `gtag`
4. Refresh the page
5. You should see requests to:
   - `google-analytics.com/g/collect`
   - Or `analytics.google.com/g/collect`
6. Click on one of these requests
7. Check the **Payload** or **Request** tab
8. You should see your Measurement ID (`G-XXXXXXXXXX`) in the URL parameters

## Common Issues and Solutions

### Issue: "I published but still not seeing data"

**Solution:**
- Make sure you're visiting the website AFTER publishing
- Clear browser cache and hard refresh (Ctrl+Shift+R)
- Wait 30-60 seconds for Real-time to update
- Check if you're using an ad blocker

### Issue: "Tag shows as Fired in GTM Preview but no data in GA4"

**Solution:**
- Verify the Measurement ID in the tag matches your GA4 property
- Check if the tag is actually published (not just in preview mode)
- Verify you're looking at the correct GA4 property
- Check Network tab for `collect` requests to confirm data is being sent

### Issue: "I see GTM loading but no GA4 requests"

**Solution:**
- Your GA4 Configuration tag might not be set up correctly
- Check if the tag has the correct Measurement ID
- Verify the tag has a trigger (All Pages)
- Make sure the tag is published

### Issue: "Requests are being blocked"

**Solution:**
- Disable ad blockers
- Check browser console for CORS errors
- Try incognito mode
- Check if your firewall/network is blocking analytics

## Testing Checklist

Run through this checklist:

1. ✅ GTM script loads (check Network tab for `gtm.js`)
2. ✅ `window.dataLayer` exists (check Console)
3. ✅ GA4 Configuration tag is published in GTM
4. ✅ Measurement ID is correct in the tag
5. ✅ Tag has "All Pages" trigger
6. ✅ No ad blockers enabled
7. ✅ Visiting website after publishing
8. ✅ Waiting 30-60 seconds
9. ✅ Looking at correct GA4 property
10. ✅ See `collect` requests in Network tab

## Still Not Working?

If after all these steps you still don't see data:

1. **Double-check Measurement ID:**
   - Go to GA4 > Admin > Data Streams
   - Copy the exact Measurement ID
   - Verify it matches in GTM tag exactly

2. **Create a test tag:**
   - In GTM, create a simple Custom HTML tag
   - Add: `<script>console.log('GTM Test');</script>`
   - Set trigger to "All Pages"
   - Publish
   - Check browser console for "GTM Test" message
   - If you see it, GTM is working, issue is with GA4 tag

3. **Check GA4 DebugView:**
   - In GA4, go to **Configure** > **DebugView**
   - Enable debug mode in your browser
   - Visit your website
   - You should see events in DebugView (more detailed than Real-time)

4. **Verify GTM Container ID:**
   - Make sure `NEXT_PUBLIC_GTM_ID` in `.env.local` matches your GTM container
   - Restart dev server after any changes

