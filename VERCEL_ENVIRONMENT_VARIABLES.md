# Vercel Environment Variables Setup

## Required Environment Variables for Production

Your application requires the following environment variables to be set in Vercel:

### 1. Supabase Configuration (Required for Database)

These are needed for both the questionnaire and risk score features:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

**Where to get these:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** > **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_KEY` (keep this secret!)

### 2. Google Tag Manager (Optional but Recommended)

```
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

**Where to get this:**
1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Copy your Container ID (format: `GTM-XXXXXXX`)

### 3. Resend API Key (Optional - for Email Notifications)

```
RESEND_API_KEY=re_your_api_key_here
```

**Where to get this:**
1. Go to [Resend](https://resend.com)
2. Sign up/login
3. Go to **API Keys**
4. Create a new key and copy it (starts with `re_`)

## How to Add Environment Variables in Vercel

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Select your project

2. **Navigate to Settings**
   - Click on your project
   - Go to **Settings** tab
   - Click **Environment Variables** in the left sidebar

3. **Add Each Variable**
   - Click **Add New**
   - Enter the variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Enter the value
   - Select which environments to apply to:
     - ✅ Production
     - ✅ Preview (optional, but recommended)
     - ✅ Development (optional)
   - Click **Save**

4. **Repeat for All Variables**
   - Add all variables listed above
   - Make sure to select **Production** for each one

5. **Redeploy**
   - After adding variables, you **MUST redeploy**
   - Go to **Deployments** tab
   - Click the three dots (⋯) on the latest deployment
   - Click **Redeploy**
   - Or push a new commit to trigger a new deployment

## Important Notes

### Variable Naming
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Variables without `NEXT_PUBLIC_` are server-side only (more secure)
- `SUPABASE_SERVICE_KEY` should **never** have `NEXT_PUBLIC_` prefix

### After Adding Variables
- **Always redeploy** after adding/changing environment variables
- Environment variables are only loaded at build time
- Changes won't take effect until you redeploy

### Verification
After redeploying, you can verify variables are set:
1. Check the build logs - they should not show "configuration missing" errors
2. Test the features:
   - Submit a questionnaire
   - Submit a risk score
   - Both should save to Supabase successfully

## Troubleshooting

### "Supabase configuration missing" Error

**Cause:** One or more Supabase environment variables are not set in Vercel.

**Solution:**
1. Check Vercel dashboard > Settings > Environment Variables
2. Verify all three Supabase variables are present:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
3. Make sure they're enabled for **Production** environment
4. Redeploy your application

### Variables Not Working After Adding

**Common Issues:**
- Forgot to redeploy after adding variables
- Variable name has a typo (check spelling carefully)
- Variable not enabled for Production environment
- Using wrong project reference ID in URL

### Quick Checklist

- [ ] All Supabase variables added to Vercel
- [ ] Variables enabled for Production environment
- [ ] No typos in variable names
- [ ] Redeployed after adding variables
- [ ] Tested in production after redeploy

