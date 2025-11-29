import { NextRequest, NextResponse } from 'next/server';
import { findCancellationUrl } from '@/lib/cancellation-links';

/**
 * Redirect endpoint for cancellation links
 * Routes all links through your domain to prevent spam flags
 * GET /api/redirect?service=netflix&hash=abc123
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const serviceName = searchParams.get('service');
  const hash = searchParams.get('hash'); // Optional: for tracking/analytics

  if (!serviceName) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Redirect - Egress</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #000;
              color: #fff;
            }
            .container {
              text-align: center;
              padding: 40px;
              max-width: 600px;
            }
            h1 { font-size: 24px; margin-bottom: 16px; }
            p { color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Invalid Request</h1>
            <p>Service name is required.</p>
          </div>
        </body>
      </html>`,
      {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }

  // Try to find a direct cancellation URL
  const cancellationUrl = findCancellationUrl(serviceName);

  if (cancellationUrl) {
    // Known service - redirect directly
    return NextResponse.redirect(cancellationUrl, 302);
  }

  // Unknown service - show helpful page with instructions
  const searchQuery = encodeURIComponent(`cancel ${serviceName} subscription`);
  const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;
  const duckDuckGoSearchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(`cancel ${serviceName} subscription`)}`;

  return new NextResponse(
    `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cancel ${serviceName} - Egress</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: #000;
            color: #fff;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            text-align: center;
          }
          h1 { font-size: 28px; margin-bottom: 8px; }
          .service-name { color: #0ea5e9; font-weight: 600; }
          .subtitle { color: #999; margin-bottom: 40px; font-size: 16px; }
          .instructions {
            background: #1a1a1a;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: left;
          }
          .instructions h2 {
            font-size: 18px;
            margin-bottom: 16px;
            color: #fff;
          }
          .instructions ol {
            margin: 0;
            padding-left: 20px;
            color: #ccc;
            line-height: 1.8;
          }
          .instructions li {
            margin-bottom: 12px;
          }
          .search-links {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
          }
          .search-btn {
            display: inline-block;
            background: #0ea5e9;
            color: #fff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            transition: background 0.2s;
          }
          .search-btn:hover {
            background: #0284c7;
          }
          .search-btn.secondary {
            background: #1a1a1a;
            border: 1px solid #333;
          }
          .search-btn.secondary:hover {
            background: #2a2a2a;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Cancel <span class="service-name">${serviceName}</span></h1>
          <p class="subtitle">We don't have a direct link for this service yet, but here's how to cancel:</p>
          
          <div class="instructions">
            <h2>How to Cancel:</h2>
            <ol>
              <li>Log into your ${serviceName} account</li>
              <li>Go to Account Settings or Billing/Subscription section</li>
              <li>Look for "Cancel Subscription" or "Manage Subscription"</li>
              <li>Follow their cancellation process</li>
            </ol>
          </div>

          <div class="search-links">
            <a href="${googleSearchUrl}" target="_blank" rel="noopener noreferrer" class="search-btn">
              Search Google
            </a>
            <a href="${duckDuckGoSearchUrl}" target="_blank" rel="noopener noreferrer" class="search-btn secondary">
              Search DuckDuckGo
            </a>
          </div>
        </div>
      </body>
    </html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    }
  );
}

