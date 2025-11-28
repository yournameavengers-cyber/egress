import { NextRequest, NextResponse } from 'next/server';
import { createReminder } from '@/lib/db';
import { sendConfirmationEmail } from '@/lib/email';
import {
  normalizeToSafeTime,
  localToUTC,
  calculateEgressTrigger,
  generateMagicHash,
  getTimezoneOffsetMinutes,
  calculateTimeRemaining
} from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceName, date, email, timezoneOffset, safeMode = true } = body;

    // Validation
    if (!serviceName || typeof serviceName !== 'string') {
      return NextResponse.json(
        { error: 'Service name is required' },
        { status: 400 }
      );
    }

    if (!date || typeof date !== 'string') {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Get timezone offset (use provided or detect)
    const tzOffset = timezoneOffset !== undefined 
      ? parseInt(timezoneOffset, 10)
      : getTimezoneOffsetMinutes();

    // Parse and normalize the date
    const localDate = new Date(date);
    if (isNaN(localDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Normalize to safe time if safe mode is enabled
    const normalizedLocalDate = normalizeToSafeTime(localDate, safeMode);

    // Convert to UTC
    const trialEndUTC = localToUTC(normalizedLocalDate, tzOffset);

    // Calculate egress trigger time
    const egressTriggerUTC = calculateEgressTrigger(trialEndUTC, tzOffset);

    // Generate magic hash
    const magicHash = generateMagicHash();

    // Create reminder in database
    const reminder = await createReminder({
      user_email: email.trim().toLowerCase(),
      service_name: serviceName.trim(),
      trial_end_utc: trialEndUTC,
      egress_trigger_utc: egressTriggerUTC,
      timezone_offset: tzOffset,
      magic_hash: magicHash
    });

    // Send confirmation email (don't await - fire and forget for faster response)
    sendConfirmationEmail(reminder).catch((error) => {
      console.error('Failed to send confirmation email:', error);
      // Don't fail the request if email fails
    });

    // Calculate time remaining for the response
    const timeRemaining = calculateTimeRemaining(egressTriggerUTC);

    // Return success response with ticket data
    return NextResponse.json({
      success: true,
      reminder: {
        id: reminder.id,
        serviceName: reminder.service_name,
        deadline: trialEndUTC.toISOString(),
        triggerTime: egressTriggerUTC.toISOString(),
        timeRemaining: {
          days: timeRemaining.days,
          hours: timeRemaining.hours,
          minutes: timeRemaining.minutes,
          totalHours: timeRemaining.totalHours
        }
      }
    });
  } catch (error) {
    console.error('Error creating reminder:', error);
    return NextResponse.json(
      { error: 'Failed to create reminder', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

