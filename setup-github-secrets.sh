#!/bin/bash

# Script to set up GitHub Actions secrets
# Prerequisites: Install GitHub CLI (gh) and authenticate: gh auth login

echo "Setting up GitHub Actions secrets for Egress..."
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI (gh) is not installed."
    echo "Install it with: brew install gh"
    echo "Then authenticate with: gh auth login"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "Not authenticated with GitHub CLI."
    echo "Run: gh auth login"
    exit 1
fi

# Get values from user or environment
if [ -z "$APP_URL" ]; then
    read -p "Enter your Vercel app URL (e.g., https://your-app.vercel.app): " APP_URL
fi

if [ -z "$CRON_SECRET" ]; then
    read -p "Enter your CRON_SECRET (or press Enter to generate one): " CRON_SECRET
    if [ -z "$CRON_SECRET" ]; then
        CRON_SECRET=$(openssl rand -hex 32)
        echo "Generated CRON_SECRET: $CRON_SECRET"
        echo "Make sure to add this same value to Vercel environment variables!"
    fi
fi

# Set the secrets
echo ""
echo "Setting GitHub secrets..."
gh secret set APP_URL --body "$APP_URL"
gh secret set CRON_SECRET --body "$CRON_SECRET"

echo ""
echo "✅ Secrets set successfully!"
echo ""
echo "Next steps:"
echo "1. Add CRON_SECRET to Vercel environment variables with the same value: $CRON_SECRET"
echo "2. Test the workflow by going to Actions tab and clicking 'Run workflow'"
echo "3. The workflow will run automatically every 10 minutes"

