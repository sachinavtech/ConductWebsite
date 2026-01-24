# How to Check if GTM is Loading in Browser DevTools

## Step-by-Step Instructions

### Step 1: Open Your Website
1. Make sure your dev server is running: `npm run dev`
2. Open your browser and go to: `http://localhost:3000`

### Step 2: Open Browser DevTools
- **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Firefox**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Safari**: Press `Cmd+Option+I` (need to enable Developer menu first)

### Step 3: Go to Network Tab
1. In DevTools, you'll see tabs at the top: **Elements**, **Console**, **Sources**, **Network**, etc.
2. Click on the **Network** tab

### Step 4: Clear and Refresh
1. Make sure the Network tab is open
2. Click the **Clear** button (🚫 icon) or press `Ctrl+Shift+R` / `Cmd+Shift+R` to hard refresh
3. This clears the network log so you can see fresh requests

### Step 5: Look for GTM Script
After refreshing, you should see a list of network requests. Look for:

**What to look for:**
- A request that says: `gtm.js?id=GTM-K6NLW6KG`
- Or: `googletagmanager.com/gtm.js`
- The domain will be: `www.googletagmanager.com`

**Where it appears:**
- In the **Name** column (left side)
- The **Status** should be `200` (success) or `304` (cached)
- The **Type** might say `script` or `xhr`

### Step 6: Filter to Find It Easier
If you see too many requests:

1. In the Network tab, look for a **Filter** box (usually at the top)
2. Type: `gtm` or `googletagmanager`
3. This will show only requests related to GTM

**Or use the filter dropdown:**
- Click the filter icon (funnel) or dropdown
- Select **JS** (JavaScript files)
- Then search for `gtm` in the filter box

### Step 7: Check the Details
Once you find the GTM request:

1. **Click on it** to see details
2. Check the **Headers** tab:
   - **Request URL**: Should be `https://www.googletagmanager.com/gtm.js?id=GTM-K6NLW6KG`
   - **Status Code**: Should be `200` (OK)
3. Check the **Response** tab:
   - Should show JavaScript code (not an error message)

## What You Should See

✅ **If GTM is loading correctly:**
- Request name: `gtm.js?id=GTM-K6NLW6KG`
- Status: `200` (green) or `304` (cached)
- Type: `script` or `xhr`
- Domain: `www.googletagmanager.com`

❌ **If GTM is NOT loading:**
- You won't see any `gtm.js` request
- Or you'll see it with status `404` (red) or `blocked`
- Or you'll see CORS errors

## Alternative: Check in Console

If you can't find it in Network tab, check the Console:

1. Go to **Console** tab in DevTools
2. Type: `window.dataLayer` and press Enter
3. If you see an array `[]` or array with objects, GTM is loaded
4. If you see `undefined`, GTM is not loading

## Troubleshooting

**If you don't see the GTM request:**

1. **Check environment variable:**
   - Make sure `.env.local` has: `NEXT_PUBLIC_GTM_ID=GTM-K6NLW6KG`
   - Restart dev server: Stop (Ctrl+C) then `npm run dev`

2. **Check the page source:**
   - Right-click on page > **View Page Source**
   - Search for `GTM-K6NLW6KG` (Ctrl+F / Cmd+F)
   - You should see it in a script tag

3. **Check for errors:**
   - Go to **Console** tab
   - Look for red error messages
   - Common errors: CORS, blocked, 404

4. **Check browser extensions:**
   - Ad blockers can block GTM
   - Try incognito/private window

## Visual Guide

```
Browser DevTools Layout:
┌─────────────────────────────────────┐
│ Elements │ Console │ Network │ ... │  ← Click "Network" tab
├─────────────────────────────────────┤
│ Filter: [gtm____________] [JS ▼]   │  ← Type "gtm" here
├─────────────────────────────────────┤
│ Name              │ Status │ Type   │
│ gtm.js?id=GTM-... │ 200    │ script │  ← This is what you want!
│ main.js           │ 200    │ script │
│ ...               │ ...    │ ...    │
└─────────────────────────────────────┘
```

