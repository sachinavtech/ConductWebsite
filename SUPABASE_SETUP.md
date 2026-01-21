# Supabase Setup for Conduct Website

## Prerequisites

1. A Supabase account and project (use the same project as your `lender_match` application)
2. Database schema already set up (from `lender_match` project)

## Configuration Steps

### 1. Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Navigate to **Settings** > **API**
4. Copy the following values:
   - **Project URL** (format: `https://<project-ref-id>.supabase.co`)
   - **anon/public key**
   - **service_role key** (keep this secret!)

### 2. Create Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

**Important:** 
- Replace `YOUR_PROJECT_REF` with your actual project reference ID (not the project name)
- Never commit `.env.local` to git (it's already in `.gitignore`)

### 3. Database Schema

Make sure your Supabase database has the following tables (from `lender_match` project):
- `accounts` - User accounts
- `questions` - Question framework
- `answers` - User responses

If you haven't set up the schema yet, run the SQL from `/Users/sshetty/Cursor/KYB/database_schema.sql` in your Supabase SQL Editor.

### 4. Verify Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/questionnaire`
3. Fill out the questionnaire
4. Submit the form
5. Check your Supabase dashboard to verify answers are being saved:
   - Go to **Table Editor** > `answers` table
   - You should see new rows with the submitted data

## Troubleshooting

### Answers not saving?

1. **Check environment variables:**
   - Verify `.env.local` exists and has correct values
   - Restart the dev server after creating/updating `.env.local`

2. **Check Supabase connection:**
   - Verify your `NEXT_PUBLIC_SUPABASE_URL` uses the project reference ID, not the project name
   - Test the connection in Supabase dashboard

3. **Check database schema:**
   - Ensure `accounts`, `questions`, and `answers` tables exist
   - Verify `questions` table has data (run the question initialization script from `lender_match`)

4. **Check browser console:**
   - Open browser DevTools > Console
   - Look for any error messages when submitting

### Common Errors

**Error: "Supabase configuration missing"**
- Solution: Check that `.env.local` exists and has all three variables set

**Error: "Failed to create account"**
- Solution: The `accounts` table might require a password. Check the database schema and modify if needed.

**Error: "Question not found for field: X"**
- Solution: Make sure the `questions` table has been populated with question data matching the field names in the questionnaire.

## Production Deployment (Vercel)

When deploying to Vercel, add the environment variables in the Vercel dashboard:

1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add all three Supabase variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
4. Set them for Production, Preview, and Development environments
5. Redeploy your application
