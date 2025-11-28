# Egress - Privacy-First Anti-Subscription Tool

Don't give us your bank password. Just tell us when to scream at you.

## Overview

Egress is a privacy-first reminder tool that helps you cancel subscription trials before you get charged. Unlike competitors that require bank account access, Egress simply sends you an email reminder 48 hours before your trial ends.

## Features

- **Privacy-First**: No bank account linking, no email scanning
- **Smart Timezone Handling**: Automatically detects and handles timezones
- **Safe Mode**: Defaults to 00:00:01 of the trial end date to avoid midnight billing issues
- **Short Trial Support**: Handles trials as short as 3 days with immediate notification logic
- **One-Click Cancellation**: Cancel reminders directly from email links
- **Beautiful UI**: Glassmorphism design with aurora background

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration from `supabase/migrations/001_initial_schema.sql`
3. Copy your project URL and API keys from Settings > API

### 3. Set Up Resend

1. Create an account at [resend.com](https://resend.com)
2. Verify your domain (or use the test domain for development)
3. Copy your API key

### 4. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Update the following:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (keep this secret!)
- `RESEND_API_KEY`: Your Resend API key
- `NEXT_PUBLIC_APP_URL`: Your app URL (e.g., `http://localhost:3000` for dev)
- `CRON_SECRET`: A random string for securing the cron endpoint

### 5. Update Email From Address

In `lib/email.ts`, update the `from` field in both email functions to match your verified Resend domain:

```typescript
from: 'Egress <noreply@yourdomain.com>'
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy

The cron job will automatically be set up via `vercel.json` and will run every 10 minutes.

### Cron Job Setup

The cron job is configured in `vercel.json` to run every 10 minutes. Make sure to set the `CRON_SECRET` environment variable in Vercel, and add it to the cron job configuration in the Vercel dashboard.

## Project Structure

```
egress/
├── app/
│   ├── api/
│   │   ├── arm-egress/      # Create reminder endpoint
│   │   ├── cron/            # Cron job handler
│   │   └── cancel/[hash]/  # Cancellation endpoint
│   ├── page.tsx             # Main page
│   └── layout.tsx            # Root layout
├── components/
│   └── EgressInterface.tsx  # Main UI component
├── lib/
│   ├── db.ts                # Database client
│   ├── email.ts             # Email service
│   └── utils.ts             # Utility functions
├── supabase/
│   └── migrations/          # Database migrations
└── vercel.json              # Vercel cron configuration
```

## Key Features Explained

### Safe Mode

When enabled (default), the system assumes the trial ends at 00:00:01 of the selected date. This prevents the "midnight problem" where users might miss the deadline due to timezone confusion.

### Egress Trigger Calculation

The system uses the formula: `max(now + 5min, trialEnd - 48h)`

This ensures:
- Reminders are never scheduled in the past
- Short trials (e.g., 3 days) trigger immediately (5 minutes from now)
- Standard trials get a 48-hour warning

### Status Management

Reminders go through these states:
- `pending`: Waiting to be sent
- `processing`: Currently being sent (locked to prevent double-sends)
- `sent`: Successfully sent
- `failed`: Failed to send
- `cancelled`: User cancelled the reminder

## License

MIT
