# Fix: GTM Not Working in Production

## The Problem

GTM works on localhost but not in production. This is almost always because the environment variable isn't set in your production environment.

## Solution: Add Environment Variable to Vercel

### Step 1: Go to Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (ConductWebsite)
3. Click on **Settings** (top navigation)
4. Click on **Environment Variables** (left sidebar)

### Step 2: Add GTM Container ID

1. Click **Add New** button
2. **Key**: `NEXT_PUBLIC_GTM_ID`
3. **Value**: `GTM-K6NLW6KG` (your actual GTM Container ID)
4. **Environment**: Select all three:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **Save**

### Step 3: Redeploy

After adding the environment variable:

1. Go to **Deployments** tab
2. Find your latest deployment
3. Click the **⋯** (three dots) menu
4. Click **Redeploy**
5. Or push a new commit to trigger a new deployment

**Important:** Environment variables are only loaded at build time, so you MUST redeploy after adding them!

## Alternative: Add via Vercel CLI

If you prefer using the command line:

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login
vercel login

# Add environment variable
vercel env add NEXT_PUBLIC_GTM_ID production
# When prompted, enter: GTM-K6NLW6KG

# Add for preview and development too
vercel env add NEXT_PUBLIC_GTM_ID preview
vercel env add NEXT_PUBLIC_GTM_ID development

# Redeploy
vercel --prod
```

## Verify Environment Variable is Set

### Method 1: Check Vercel Dashboard

1. Go to Vercel > Your Project > Settings > Environment Variables
2. You should see `NEXT_PUBLIC_GTM_ID` listed
3. Make sure it's enabled for Production

### Method 2: Check Build Logs

1. Go to Vercel > Your Project > Deployments
2. Click on a deployment
3. Click **Build Logs**
4. Look for environment variables being loaded
5. You should see `NEXT_PUBLIC_GTM_ID` in the logs

### Method 3: Check Production Site

1. Visit your production site
2. View page source (Right-click > View Page Source)
3. Search for `GTM-K6NLW6KG` (Ctrl+F / Cmd+F)
4. You should see it in the GTM script tag
5. If you don't see it, the environment variable isn't set

## Common Issues

### Issue: "I added the variable but still not working"

**Check:**
- Did you redeploy after adding the variable?
- Is the variable name exactly `NEXT_PUBLIC_GTM_ID`? (case-sensitive)
- Is it enabled for Production environment?
- Check the build logs for errors

### Issue: "Variable shows in Vercel but not in production"

**Solution:**
- Environment variables are only loaded at build time
- You MUST redeploy after adding/changing variables
- Push a new commit or manually redeploy

### Issue: "Works in Preview but not Production"

**Check:**
- Make sure the variable is enabled for Production (not just Preview)
- Redeploy the production deployment specifically

## Quick Checklist

- [ ] Added `NEXT_PUBLIC_GTM_ID` to Vercel environment variables
- [ ] Set value to `GTM-K6NLW6KG` (your actual GTM ID)
- [ ] Enabled for Production environment
- [ ] Redeployed after adding the variable
- [ ] Verified GTM script appears in production page source
- [ ] Checked production site Network tab for `gtm.js` requests

## Testing Production

After redeploying:

1. Visit your production site
2. Open DevTools > Network tab
3. Refresh the page
4. Look for: `gtm.js?id=GTM-K6NLW6KG`
5. Status should be `200`
6. Filter by `collect` to see GA4 requests

## Why This Happens

Next.js environment variables that start with `NEXT_PUBLIC_` are:
- Embedded at build time
- Not available at runtime
- Must be set in the build environment (Vercel)

If the variable isn't set in Vercel, it will be `undefined` in production, even if it works locally with `.env.local`.


