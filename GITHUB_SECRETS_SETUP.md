# GitHub Actions Secrets Setup

## Required Secrets

You need to add these 2 secrets to your GitHub repository:

### 1. APP_URL
- **Name:** `APP_URL`
- **Value:** Your Vercel deployment URL
  - Example: `https://your-app-name.vercel.app`
  - Get this from your Vercel dashboard after deployment

### 2. CRON_SECRET
- **Name:** `CRON_SECRET`
- **Value:** `15b15f21ade3673b1ad795eaafd934f9a1100d54b3dd5d09fdd729a25cf7dfbb`
- **Important:** Use this EXACT same value in Vercel environment variables too!

## How to Add Secrets

1. Go to: https://github.com/yournameavengers-cyber/egress/settings/secrets/actions
2. Click "New repository secret"
3. Add each secret with the name and value above

## Also Add to Vercel

Make sure to add `CRON_SECRET` to Vercel environment variables:
1. Go to your Vercel project → Settings → Environment Variables
2. Add:
   - **Name:** `CRON_SECRET`
   - **Value:** `15b15f21ade3673b1ad795eaafd934f9a1100d54b3dd5d09fdd729a25cf7dfbb`

## Test the Workflow

After adding secrets:
1. Go to: https://github.com/yournameavengers-cyber/egress/actions
2. Click "Process Egress Reminders" workflow
3. Click "Run workflow" to test manually
4. It will run automatically every 10 minutes once set up

