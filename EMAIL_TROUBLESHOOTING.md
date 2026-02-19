# Email Troubleshooting Guide

## Quick Checklist

### 1. Verify RESEND_API_KEY is Set in Vercel Production

**Check via Test Endpoint:**
Visit: `https://your-production-domain.com/api/test-email-config`

Expected response if configured:
```json
{
  "configured": true,
  "keyExists": true,
  "keyStartsWithRe": true,
  "keyLength": 51,
  "message": "✅ RESEND_API_KEY is configured! ..."
}
```

If you see `"configured": false`, the key is not set in Vercel.

**Fix:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `RESEND_API_KEY` with your key (starts with `re_`)
3. Enable for **Production** environment
4. **Redeploy** (critical!)

### 2. Check Vercel Function Logs

**Steps:**
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on your latest production deployment
3. Click **Functions** tab (or **Runtime Logs**)
4. Look for email-related errors:
   - `EMAIL NOTIFICATION FAILED: RESEND_API_KEY not configured...`
   - `Email notification failed: ...`
   - `Resend API error: ...`

**What to look for:**
- If you see "RESEND_API_KEY not configured" → Key is missing in Vercel
- If you see "Resend API error" → Check the error details
- If you see no email logs → Email function might not be executing

### 3. Check Resend Dashboard

**Steps:**
1. Go to https://resend.com/dashboard
2. Check **Logs** or **Emails** section
3. Look for:
   - Failed emails
   - Rate limit errors
   - API key issues
   - Domain verification issues

**Common Issues:**
- **Domain not verified**: If using custom domain, verify it in Resend
- **Rate limit exceeded**: Free tier is 100 emails/day
- **API key revoked**: Check if key is still active
- **Invalid recipient**: Check email address format

### 4. Verify Email Address

**Check:**
- Is `sachin@conductfinance.com` the correct email?
- Check spam/junk folder
- Check email filters/rules

### 5. Test Email Function Directly

**Create a test endpoint** (temporary):

Visit: `https://your-production-domain.com/api/test-email-config`

This will show if the key is configured. If it is, try manually triggering an email.

### 6. Check Recent Changes

**Questions to ask:**
- Did you recently redeploy?
- Did environment variables get reset?
- Did you change the Resend API key?
- Did you hit the free tier limit (100 emails/day)?

## Common Issues & Solutions

### Issue: "RESEND_API_KEY not configured"

**Symptoms:**
- Test endpoint shows `"configured": false`
- Logs show "RESEND_API_KEY not configured"

**Solution:**
1. Add `RESEND_API_KEY` to Vercel environment variables
2. Enable for Production
3. Redeploy

### Issue: "Resend API error: Unauthorized"

**Symptoms:**
- Logs show "Resend API error"
- Error contains "Unauthorized" or "401"

**Solutions:**
- API key is invalid or expired
- Regenerate API key in Resend dashboard
- Update in Vercel environment variables
- Redeploy

### Issue: "Resend API error: Rate limit exceeded"

**Symptoms:**
- Error mentions rate limit or "429"

**Solution:**
- Free tier: 100 emails/day
- Wait 24 hours or upgrade Resend plan
- Check Resend dashboard for usage

### Issue: Emails Sent But Not Received

**Check:**
1. Spam/junk folder
2. Email filters
3. Resend dashboard → Logs (shows delivery status)
4. Email address is correct: `sachin@conductfinance.com`

### Issue: No Email Logs in Vercel

**Possible causes:**
- Email function not executing
- Logs not being captured
- Check if form submission is actually calling the API

**Debug:**
- Add console.log before email call
- Check if API route is being hit
- Verify form submission is successful

## Step-by-Step Debugging

### Step 1: Verify Configuration
```bash
# Visit in production:
https://your-domain.com/api/test-email-config
```

### Step 2: Check Vercel Logs
1. Vercel Dashboard → Deployments → Latest → Functions/Logs
2. Submit a form
3. Immediately check logs for email errors

### Step 3: Check Resend Dashboard
1. Go to Resend dashboard
2. Check Logs/Emails section
3. See if emails are being sent
4. Check delivery status

### Step 4: Test Email Manually
If key is configured, test sending an email directly via Resend API to verify the key works.

## Quick Fix Checklist

- [ ] `RESEND_API_KEY` added to Vercel environment variables
- [ ] Variable enabled for **Production** environment
- [ ] Redeployed after adding variable
- [ ] Checked Vercel function logs for errors
- [ ] Checked Resend dashboard for failed emails
- [ ] Verified email address: `sachin@conductfinance.com`
- [ ] Checked spam folder
- [ ] Verified Resend API key is active (not revoked)
- [ ] Checked Resend usage limits (100/day free tier)

## Next Steps

1. **Check the test endpoint** first: `https://your-domain.com/api/test-email-config`
2. **Check Vercel logs** after submitting a form
3. **Check Resend dashboard** for email status
4. Share what you find and we can fix the specific issue

