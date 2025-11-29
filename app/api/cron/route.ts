import { NextRequest, NextResponse } from 'next/server';
import {
  getPendingReminders,
  lockReminderForProcessing,
  updateReminderStatus,
  supabaseAdmin
} from '@/lib/db';
import { sendEgressReminder } from '@/lib/email';

/**
 * Cron job handler that runs every 10 minutes
 * Processes pending reminders that are ready to be sent
 */
export async function GET(request: NextRequest) {
  // Verify the request is authorized
  // Supports: Vercel Cron (x-vercel-cron header), GitHub Actions, or CRON_SECRET
  const cronSecret = request.headers.get('authorization');
  const vercelCronHeader = request.headers.get('x-vercel-cron');
  const userAgent = request.headers.get('user-agent') || '';
  
  // Allow if:
  // 1. It's from Vercel Cron (has x-vercel-cron header)
  // 2. It's from GitHub Actions (user-agent contains GitHub Actions)
  // 3. Authorization header matches CRON_SECRET
  const isVercelCron = !!vercelCronHeader;
  const isGitHubActions = userAgent.includes('GitHub Actions');
  const isValidSecret = cronSecret === `Bearer ${process.env.CRON_SECRET}`;
  
  if (!isVercelCron && !isGitHubActions && !isValidSecret) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // In development, allow but log a warning
    console.warn('Cron endpoint called without proper authorization');
  }

  try {
    // Get all pending reminders that are ready
    const pendingReminders = await getPendingReminders();

    console.log(`[Cron] Found ${pendingReminders.length} pending reminders ready to process`);
    
    if (pendingReminders.length === 0) {
      // Also check if there are any reminders at all (for debugging)
      const { data: allReminders } = await supabaseAdmin
        .from('reminders')
        .select('id, status, egress_trigger_utc, user_email, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
      return NextResponse.json({
        success: true,
        message: 'No pending reminders to process',
        processed: 0,
        debug: {
          currentTime: new Date().toISOString(),
          recentReminders: allReminders.data || []
        }
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
        console.log(`[Cron] Processing reminder ${reminder.id} for ${reminder.user_email}`);
        
        // Try to lock the reminder for processing (atomic operation)
        const lockedReminder = await lockReminderForProcessing(reminder.id);

        // If lock failed, another process is handling it
        if (!lockedReminder) {
          console.log(`[Cron] Reminder ${reminder.id} already locked by another process`);
          results.skipped++;
          continue;
        }

        console.log(`[Cron] Sending email for reminder ${reminder.id}`);
        // Send the email
        await sendEgressReminder(lockedReminder);
        console.log(`[Cron] Email sent successfully for reminder ${reminder.id}`);

        // Mark as sent
        await updateReminderStatus(lockedReminder.id, 'sent');
        results.sent++;
        results.processed++;
      } catch (error) {
        console.error(`[Cron] Failed to process reminder ${reminder.id}:`, error);

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

