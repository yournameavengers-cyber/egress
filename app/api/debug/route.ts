import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

/**
 * Debug endpoint to check reminder status and manually trigger processing
 * GET /api/debug - Shows all reminders
 * POST /api/debug - Manually triggers the cron job
 */
export async function GET(request: NextRequest) {
  try {
    const { data: reminders, error } = await supabaseAdmin
      .from('reminders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const now = new Date();
    const remindersWithStatus = (reminders || []).map((r: any) => {
      const triggerTime = new Date(r.egress_trigger_utc);
      const isReady = triggerTime <= now;
      const timeUntilTrigger = triggerTime.getTime() - now.getTime();
      
      return {
        id: r.id,
        service: r.service_name,
        email: r.user_email,
        status: r.status,
        triggerTime: r.egress_trigger_utc,
        triggerTimeLocal: triggerTime.toLocaleString(),
        isReady,
        timeUntilTriggerMs: timeUntilTrigger,
        timeUntilTriggerMinutes: Math.round(timeUntilTrigger / 1000 / 60),
        created: r.created_at,
        now: now.toISOString(),
        nowLocal: now.toLocaleString()
      };
    });

    return NextResponse.json({
      currentTime: now.toISOString(),
      reminders: remindersWithStatus
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Manually trigger the cron job
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not set' }, { status: 500 });
  }

  try {
    const response = await fetch(`${appUrl}/api/cron`, {
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    });

    const data = await response.json();
    return NextResponse.json({
      success: true,
      cronResponse: data
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to trigger cron' },
      { status: 500 }
    );
  }
}

