# Egress Setup Guide

## Step 1: Run Database Migration

1. Go to your Supabase project: https://kmxukjozoeixukfsceli.supabase.co
2. Navigate to **SQL Editor**
3. Create a new query and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click **Run** to execute the migration

This will create:
- `reminders` table
- Required indexes
- Status enum type
- Helper functions

## Step 2: Add Environment Variables to Vercel

Go to your Vercel project → **Settings** → **Environment Variables** and add:

### Required Variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://kmxukjozoeixukfsceli.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtteHVram96b2VpeHVrZnNjZWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMjkwMDYsImV4cCI6MjA3OTkwNTAwNn0.lL-71l1t1h7Zvw3I1hJFbhE3DLA-53BMsw4HMVi3PWE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtteHVram96b2VpeHVrZnNjZWxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDMyOTAwNiwiZXhwIjoyMDc5OTA1MDA2fQ.rXxOuE3QBnvoEnDr6OVMMJ7233VhRIqx1C5S6rRJ1_8
```

### Additional Required Variables:

1. **RESEND_API_KEY** - Get this from [resend.com](https://resend.com)
   - Sign up/login
   - Create an API key
   - Add it to Vercel

2. **NEXT_PUBLIC_APP_URL** - Your Vercel deployment URL
   - After first deployment, use: `https://your-app-name.vercel.app`
   - Or your custom domain if you have one

3. **CRON_SECRET** - Generate a random secret string
   - You can use: `openssl rand -hex 32`
   - Or any random string (used to secure the cron endpoint)

## Step 3: Update Email From Address

After setting up Resend and verifying your domain:

1. Edit `lib/email.ts`
2. Update the `from` field in both `sendEgressReminder()` and `sendConfirmationEmail()`:
   ```typescript
   from: 'Egress <noreply@yourdomain.com>'
   ```

## Step 4: Set Up GitHub Actions Cron (After Deployment)

1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:
   - **APP_URL**: Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
   - **CRON_SECRET**: The same secret you set in Vercel

The GitHub Actions workflow will automatically run every 10 minutes to process reminders.

## Step 5: Test the Application

1. Visit your deployed app
2. Create a test reminder with a date in the near future
3. Check that you receive a confirmation email
4. Wait for the reminder email (or manually trigger the cron endpoint)

## Troubleshooting

- **Build fails**: Make sure all environment variables are set in Vercel
- **Emails not sending**: Verify Resend API key and domain verification
- **Database errors**: Ensure the migration has been run in Supabase
- **Cron not working**: Check GitHub Actions secrets are set correctly


