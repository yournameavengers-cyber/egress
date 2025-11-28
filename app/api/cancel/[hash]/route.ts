import { NextRequest, NextResponse } from 'next/server';
import { getReminderByMagicHash, cancelReminder } from '@/lib/db';

/**
 * GET endpoint for cancelling a reminder via magic hash
 * Supports both cancellation and deletion actions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash } = await params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action'); // 'delete' or null (defaults to cancel)

    if (!hash) {
      return NextResponse.json(
        { error: 'Magic hash is required' },
        { status: 400 }
      );
    }

    // Get the reminder by magic hash
    const reminder = await getReminderByMagicHash(hash);

    if (!reminder) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reminder Not Found - Egress</title>
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
              }
              h1 { font-size: 24px; margin-bottom: 16px; }
              p { color: #999; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Reminder Not Found</h1>
              <p>This reminder has already been cancelled or does not exist.</p>
            </div>
          </body>
        </html>`,
        {
          status: 404,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    // Check if already cancelled
    if (reminder.status === 'cancelled') {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Already Cancelled - Egress</title>
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
              }
              h1 { font-size: 24px; margin-bottom: 16px; }
              p { color: #999; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Already Cancelled</h1>
              <p>This reminder has already been cancelled.</p>
            </div>
          </body>
        </html>`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    // Cancel the reminder
    await cancelReminder(reminder.id);

    const message = action === 'delete'
      ? 'Reminder deleted successfully.'
      : 'Reminder cancelled successfully. You will not receive any further notifications.';

    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reminder ${action === 'delete' ? 'Deleted' : 'Cancelled'} - Egress</title>
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
              max-width: 500px;
            }
            .success {
              background: #28a745;
              color: #fff;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            h1 { font-size: 24px; margin-bottom: 16px; }
            p { color: #999; margin-bottom: 8px; }
            .details {
              background: #1a1a1a;
              padding: 20px;
              border-radius: 8px;
              margin-top: 20px;
              font-family: 'Courier New', monospace;
              font-size: 14px;
            }
            .details div {
              margin-bottom: 8px;
            }
            .label { color: #666; }
            .value { color: #fff; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">
              <h1>✓ ${action === 'delete' ? 'Deleted' : 'Cancelled'}</h1>
              <p>${message}</p>
            </div>
            <div class="details">
              <div><span class="label">TARGET:</span> <span class="value">${reminder.service_name}</span></div>
              <div><span class="label">STATUS:</span> <span class="value">Cancelled</span></div>
            </div>
          </div>
        </body>
      </html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  } catch (error) {
    console.error('Error cancelling reminder:', error);
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error - Egress</title>
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
            }
            h1 { font-size: 24px; margin-bottom: 16px; color: #dc3545; }
            p { color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Error</h1>
            <p>Failed to cancel reminder. Please try again later.</p>
          </div>
        </body>
      </html>`,
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

