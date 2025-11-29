import { Resend } from 'resend';
import { formatDateForTimezone } from './utils';
import type { Reminder } from './db';
import { getCancellationUrl } from './cancellation-links';

// Lazy initialization to avoid build-time errors
let resendInstance: Resend | null = null;

function getResendClient(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Sends the main egress reminder email when the trigger time is reached
 */
export async function sendEgressReminder(reminder: Reminder): Promise<void> {
  const deadlineDate = formatDateForTimezone(
    new Date(reminder.trial_end_utc),
    reminder.timezone_offset
  );

  // Get the actual cancellation URL for the service
  const serviceCancelUrl = getCancellationUrl(reminder.service_name);
  
  // Calculate money saved
  const subscriptionPrice = reminder.subscription_price || 0;
  const formattedPrice = subscriptionPrice.toFixed(2);
  const moneySaved = `$${formattedPrice} → $0.00`;

  const resend = getResendClient();
  const { error } = await resend.emails.send({
    from: 'Egress <onboarding@resend.dev>', // Using Resend test domain - update to your verified domain for production
    to: reminder.user_email,
    subject: `⚠️ ACT NOW: Cancel ${reminder.service_name} within 48 hours`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Egress Alert</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: #000; color: #fff; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">EGRESS PROTOCOL</h1>
            <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.7; letter-spacing: 1px;">ACTIVE ALERT</p>
          </div>
          
          <div style="background-color: #fff; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
              <h2 style="margin: 0 0 10px 0; color: #856404; font-size: 20px;">⚠️ Time to Cancel</h2>
              <p style="margin: 0; color: #856404;">Your trial for <strong>${reminder.service_name}</strong> ends on <strong>${deadlineDate}</strong>.</p>
            </div>

            <p style="font-size: 16px; margin-bottom: 20px;">
              If you do nothing, you will be charged automatically. This is your 48-hour warning.
            </p>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin: 30px 0; border: 1px solid #dee2e6;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #6c757d; text-transform: uppercase; letter-spacing: 1px;">Money Saved if You Cancel Now</p>
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #28a745;">${moneySaved}</p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #6c757d;">(Cancel before ${deadlineDate} to avoid charges)</p>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="${serviceCancelUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #000; color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; letter-spacing: 1px;">
                CANCEL NOW
              </a>
            </div>

            <p style="font-size: 14px; color: #6c757d; text-align: center; margin-top: 30px;">
              This link will take you directly to ${reminder.service_name}'s cancellation page.
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; padding: 20px;">
            <p style="font-size: 12px; color: #6c757d; margin: 0;">
              Egress - Privacy-First Anti-Subscription Tool
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
EGRESS PROTOCOL - ACTIVE ALERT

⚠️ Time to Cancel

Your trial for ${reminder.service_name} ends on ${deadlineDate}.

If you do nothing, you will be charged automatically. This is your 48-hour warning.

Money saved if you cancel: ${moneySaved}

Cancel now: ${serviceCancelUrl}

---
Egress - Privacy-First Anti-Subscription Tool
    `.trim()
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Sends a confirmation email immediately after a reminder is created
 */
export async function sendConfirmationEmail(reminder: Reminder): Promise<void> {
  const deadlineDate = formatDateForTimezone(
    new Date(reminder.trial_end_utc),
    reminder.timezone_offset
  );
  
  const triggerDate = formatDateForTimezone(
    new Date(reminder.egress_trigger_utc),
    reminder.timezone_offset
  );

  const cancelUrl = `${appUrl}/api/cancel/${reminder.magic_hash}`;

  const resend = getResendClient();
  const { error } = await resend.emails.send({
    from: 'Egress <onboarding@resend.dev>', // Using Resend test domain - update to your verified domain for production
    to: reminder.user_email,
    subject: `Egress Protocol Armed: ${reminder.service_name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Egress Confirmation</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: #000; color: #fff; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">EGRESS PROTOCOL</h1>
            <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.7; letter-spacing: 1px;">ARMED</p>
          </div>
          
          <div style="background-color: #fff; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
              <h2 style="margin: 0 0 10px 0; color: #155724; font-size: 20px;">✓ Sequence Initialized</h2>
              <p style="margin: 0; color: #155724;">Your reminder has been set successfully.</p>
            </div>

            <div style="font-family: 'Courier New', monospace; background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
              <div style="margin-bottom: 15px;">
                <span style="color: #6c757d; font-size: 12px; text-transform: uppercase;">TARGET:</span>
                <span style="display: block; font-size: 18px; margin-top: 5px; color: #000;">${reminder.service_name}</span>
              </div>
              <div style="margin-bottom: 15px;">
                <span style="color: #6c757d; font-size: 12px; text-transform: uppercase;">DEADLINE:</span>
                <span style="display: block; font-size: 18px; margin-top: 5px; color: #000;">${deadlineDate}</span>
              </div>
              <div>
                <span style="color: #6c757d; font-size: 12px; text-transform: uppercase;">REMINDER SET FOR:</span>
                <span style="display: block; font-size: 18px; margin-top: 5px; color: #000;">${triggerDate}</span>
              </div>
            </div>

            <p style="font-size: 14px; color: #6c757d; text-align: center; margin-top: 30px;">
              You will receive an alert 48 hours before your trial ends.
            </p>

            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 40px 0;" />

            <p style="font-size: 12px; color: #6c757d; text-align: center; margin: 0;">
              Need to cancel this reminder? <a href="${cancelUrl}" style="color: #6c757d; text-decoration: underline;">Click here</a>
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; padding: 20px;">
            <p style="font-size: 12px; color: #6c757d; margin: 0;">
              Egress - Privacy-First Anti-Subscription Tool
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
EGRESS PROTOCOL - ARMED

✓ Sequence Initialized

Your reminder has been set successfully.

TARGET: ${reminder.service_name}
DEADLINE: ${deadlineDate}
REMINDER SET FOR: ${triggerDate}

You will receive an alert 48 hours before your trial ends.

Need to cancel this reminder? ${cancelUrl}

---
Egress - Privacy-First Anti-Subscription Tool
    `.trim()
  });

  if (error) {
    throw new Error(`Failed to send confirmation email: ${error.message}`);
  }
}

