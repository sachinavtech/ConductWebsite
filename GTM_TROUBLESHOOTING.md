# GTM Troubleshooting: "Tag Not Found" Issue

## Issue: GTM Preview says "Google Tags GTM-K6NLW6KG not found"

This means GTM Preview detected your container ID but can't verify tags are firing. Here's how to fix it:

## Step-by-Step Fix

### 1. Verify Environment Variable is Set

Check that your `.env.local` file has the GTM ID:

```bash
NEXT_PUBLIC_GTM_ID=GTM-K6NLW6KG
```

**Important:** 
- The ID must match exactly: `GTM-K6NLW6KG` (no spaces, correct format)
- Restart your dev server after adding/changing this: `npm run dev`

### 2. Verify GTM Script is Loading

1. Open your website: `http://localhost:3000`
2. Open Browser DevTools (F12)
3. Go to **Network** tab
4. Refresh the page
5. Look for: `googletagmanager.com/gtm.js?id=GTM-K6NLW6KG`
6. Check the status:
   - ✅ **200** = Script is loading correctly
   - ❌ **404** = Wrong GTM ID or script not found
   - ❌ **Blocked** = Browser extension blocking it

### 3. Check if Tags are Published

In GTM Preview mode, tags only fire if they're **published**:

1. Go to GTM dashboard
2. Check if you see **"Submit"** button in top right (means you have unpublished changes)
3. If you see "Submit", you need to publish:
   - Click **Submit**
   - Add version name/description
   - Click **Publish**
4. After publishing, refresh your website and test again

### 4. Verify Tags are Configured Correctly

1. In GTM, go to **Tags** section
2. Make sure you have at least one tag (your GA4 Configuration tag)
3. Check that the tag:
   - Has a trigger set (should be "All Pages")
   - Is not paused/disabled
   - Has correct configuration (Measurement ID, etc.)

### 5. Check Browser Extensions

Some browser extensions block GTM:

1. **Ad blockers** (uBlock Origin, AdBlock Plus, etc.)
2. **Privacy extensions** (Privacy Badger, Ghostery, etc.)
3. **Disable them temporarily** to test, or use an incognito/private window

### 6. Verify dataLayer is Working

1. Open your website
2. Open Browser DevTools > **Console** tab
3. Type: `window.dataLayer` and press Enter
4. You should see an array with objects
5. If you see `undefined` or errors, GTM isn't loading

### 7. Check for JavaScript Errors

1. Open Browser DevTools > **Console** tab
2. Look for red error messages
3. Common errors:
   - `GTM is not defined` = GTM script not loading
   - `dataLayer is not defined` = dataLayer initialization issue
   - CORS errors = Cross-origin issues

### 8. Verify GTM Container ID Matches

Make sure the GTM ID in your code matches what's in GTM Preview:

1. In GTM Preview, it says: `GTM-K6NLW6KG`
2. In your `.env.local`, it should be: `NEXT_PUBLIC_GTM_ID=GTM-K6NLW6KG`
3. They must match exactly (case-sensitive)

### 9. Check GTM Preview Connection

In GTM Preview mode:

1. Make sure the preview panel shows "Connected"
2. Check the **Summary** tab - it should show tags
3. If it says "No tags found", your tags aren't firing
4. Check the **Tags** tab - you should see your tags listed
5. Click on a tag to see if it's firing (green checkmark = fired)

### 10. Common Solutions

**Solution A: Restart Dev Server**
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

**Solution B: Clear Browser Cache**
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or clear browser cache completely

**Solution C: Use Incognito/Private Window**
- Opens without extensions
- Tests if extensions are blocking

**Solution D: Check GTM Workspace**
- Make sure you're testing in the correct GTM workspace
- If you have multiple workspaces, make sure you're in the right one

## Quick Test Checklist

- [ ] `.env.local` has `NEXT_PUBLIC_GTM_ID=GTM-K6NLW6KG`
- [ ] Dev server restarted after adding GTM ID
- [ ] GTM script loads (check Network tab for `gtm.js`)
- [ ] Tags are published in GTM (not just saved as draft)
- [ ] Tags have triggers set (All Pages)
- [ ] No browser extensions blocking GTM
- [ ] `window.dataLayer` exists in console
- [ ] No JavaScript errors in console

## Still Not Working?

If after all these steps it still doesn't work:

1. **Verify GTM Container ID is correct:**
   - Go to GTM dashboard
   - Check the container ID in the top right (should be `GTM-K6NLW6KG`)
   - Make sure it matches your `.env.local`

2. **Test with a simple tag:**
   - Create a test Custom HTML tag that just does `console.log('GTM Test')`
   - Set trigger to "All Pages"
   - Publish it
   - Check browser console for the log message

3. **Check Next.js build:**
   - Make sure environment variable is being read
   - Check if `process.env.NEXT_PUBLIC_GTM_ID` is defined at build time

