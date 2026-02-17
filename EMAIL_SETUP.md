# Email Notification Setup

## Overview

The application now sends email notifications to `sachin@conductfinance.com` when:
1. Someone completes the **Risk Score questionnaire**
2. Someone completes the **Get Matched questionnaire**

## Email Service: Resend

We're using [Resend](https://resend.com) for email delivery. It's reliable, has a free tier (100 emails/day), and is easy to set up.

### Setup Steps

1. **Create a Resend Account**
   - Go to https://resend.com
   - Sign up for a free account
   - Verify your email

2. **Get Your API Key**
   - Once logged in, go to **API Keys** in the dashboard
   - Click **Create API Key**
   - Give it a name (e.g., "Conduct Website Notifications")
   - Copy the API key (starts with `re_`)

3. **Add Domain (Optional but Recommended)**
   - For production, you should verify your domain
   - Go to **Domains** in Resend dashboard
   - Add `conductfinance.com` (or your domain)
   - Follow the DNS verification steps
   - This allows you to send from `notifications@conductfinance.com`

4. **Add Environment Variable**
   - Add to your `.env.local` file:
     ```
     RESEND_API_KEY=re_your_api_key_here
     ```
   - For production (Vercel), add the same variable in your project settings

5. **Restart Your Dev Server**
   - After adding the environment variable, restart your Next.js dev server

## Email Format

### Risk Score Submission Email

**Subject:** `New Conduct Risk Score Submission - [Business Name]`

**Content includes:**
- Part 1: All business information (Legal Name, DBA, State, Entity Type, EIN, Address, Date of Formation)
- Part 2: Digital presence data (Website, LinkedIn, Facebook, Yelp/Google, Phone, Bank Account)
- Contact email
- Submission timestamp

### Questionnaire/Match Submission Email

**Subject:** `New Lending Match Submission - [User Email]`

**Content includes:**
- All questionnaire answers (formatted nicely)
- Match recommendation (if available):
  - Recommended Partner
  - Product Type
  - Reason for match
  - Confidence level
- Submission timestamp

## Testing

1. Complete a Risk Score questionnaire
2. Check your email at `sachin@conductfinance.com`
3. You should receive a formatted email with all the data

## Fallback Behavior

If `RESEND_API_KEY` is not configured:
- The application will still work normally
- Data will still be saved to the database
- Email notifications will be logged to the console instead of being sent
- This allows development without email setup

## Alternative Email Services

If you prefer a different email service, you can modify `src/lib/email.ts`:

- **SendGrid**: Replace the fetch call with SendGrid's SDK
- **AWS SES**: Use AWS SDK for SES
- **Nodemailer**: Use Nodemailer with SMTP
- **Mailgun**: Use Mailgun's API

The email utility is designed to be easily replaceable.

## Production Notes

- Make sure to add `RESEND_API_KEY` to your Vercel environment variables
- Consider setting up domain verification for better deliverability
- Monitor your Resend dashboard for email delivery status
- The free tier includes 100 emails/day, which should be sufficient for initial testing

