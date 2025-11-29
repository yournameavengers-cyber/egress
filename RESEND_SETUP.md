# Resend Setup Guide

## What is Resend?

Resend is an email API service that sends transactional emails. It's developer-friendly and has good deliverability.

## Step-by-Step Setup

### 1. Add API Key to Vercel

1. Go to your Vercel project dashboard
2. Navigate to: **Settings** → **Environment Variables**
3. Click **Add New**
4. Add:
   - **Key:** `RESEND_API_KEY`
   - **Value:** `your_resend_api_key_here` (get from https://resend.com/api-keys)
   - **Environment:** Select all (Production, Preview, Development)
5. Click **Save**

### 2. Update Email From Address

You need to update the email sender address in the code. You have two options:

#### Option A: Use Resend's Test Domain (Quick Start)
- Resend provides a test domain: `onboarding@resend.dev`
- This works immediately but emails go to spam
- Good for testing only

#### Option B: Verify Your Own Domain (Production)
- Add your domain in Resend dashboard
- Verify DNS records
- Use your own domain (e.g., `noreply@yourdomain.com`)
- Better deliverability

### 3. Update the Code

Edit `lib/email.ts` and change the `from` field in both email functions:

**For testing (using Resend's domain):**
```typescript
from: 'Egress <onboarding@resend.dev>'
```

**For production (using your domain):**
```typescript
from: 'Egress <noreply@yourdomain.com>'
```

### 4. Redeploy

After adding the environment variable:
- Vercel will automatically redeploy, OR
- Go to Deployments tab and click "Redeploy"

## Domain Verification (For Production)

If you want to use your own domain:

1. Go to: https://resend.com/domains
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records Resend provides to your domain registrar
5. Wait for verification (usually a few minutes)
6. Once verified, update the `from` address in `lib/email.ts`

## Testing

1. Create a test reminder in your app
2. Check your email (and spam folder if using test domain)
3. You should receive a confirmation email

## Current API Key

⚠️ **Never commit API keys to git!** Always use environment variables.

⚠️ **Security Note:** Never commit API keys to git. Always use environment variables.

