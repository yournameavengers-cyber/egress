import { NextRequest, NextResponse } from 'next/server';
import {
  getPendingReminders,
  lockReminderForProcessing,
  updateReminderStatus
} from '@/lib/db';
import { sendEgressReminder } from '@/lib/email';

/**
 * Cron job handler that runs every 10 minutes
 * Processes pending reminders that are ready to be sent
 */
export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  // Vercel sends a 'x-vercel-cron' header, or you can use CRON_SECRET
  const cronSecret = request.headers.get('authorization');
  const vercelCronHeader = request.headers.get('x-vercel-cron');
  
  // Allow if it's from Vercel Cron OR if CRON_SECRET matches
  if (!vercelCronHeader && cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    // In production, you might want to be stricter
    // For now, we'll allow it but log a warning
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    // Get all pending reminders that are ready
    const pendingReminders = await getPendingReminders();

    if (pendingReminders.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending reminders to process',
        processed: 0
      });
    }

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0
    };

    // Process each reminder
    for (const reminder of pendingReminders) {
      try {
        // Try to lock the reminder for processing (atomic operation)
        const lockedReminder = await lockReminderForProcessing(reminder.id);

        // If lock failed, another process is handling it
        if (!lockedReminder) {
          results.skipped++;
          continue;
        }

        // Send the email
        await sendEgressReminder(lockedReminder);

        // Mark as sent
        await updateReminderStatus(lockedReminder.id, 'sent');
        results.sent++;
        results.processed++;
      } catch (error) {
        console.error(`Failed to process reminder ${reminder.id}:`, error);

        // Try to mark as failed (only if we successfully locked it)
        try {
          await updateReminderStatus(reminder.id, 'failed');
        } catch (updateError) {
          console.error(`Failed to update reminder status:`, updateError);
        }

        results.failed++;
        results.processed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} reminders`,
      ...results
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process reminders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

