import { randomBytes } from 'crypto';

/**
 * Normalizes a date to safe mode (00:00:01) or uses the provided time
 * @param date - The date to normalize
 * @param safeMode - If true, sets time to 00:00:01 of the date
 * @returns Normalized date
 */
export function normalizeToSafeTime(date: Date, safeMode: boolean): Date {
  if (safeMode) {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 1, 0); // 00:00:01
    return normalized;
  }
  return date;
}

/**
 * Converts a local date to UTC based on timezone offset
 * @param localDate - The date in local timezone
 * @param timezoneOffsetMinutes - Timezone offset in minutes (e.g., -300 for EST)
 * @returns Date in UTC
 */
export function localToUTC(localDate: Date, timezoneOffsetMinutes: number): Date {
  // Create a new date with the local time
  const utcTime = localDate.getTime() - (timezoneOffsetMinutes * 60 * 1000);
  return new Date(utcTime);
}

/**
 * Converts UTC date to local timezone for display
 * @param utcDate - The date in UTC
 * @param timezoneOffsetMinutes - Timezone offset in minutes
 * @returns Date in local timezone
 */
export function utcToLocal(utcDate: Date, timezoneOffsetMinutes: number): Date {
  const localTime = utcDate.getTime() + (timezoneOffsetMinutes * 60 * 1000);
  return new Date(localTime);
}

/**
 * Calculates the egress trigger time using the formula:
 * max(now + 5min, trialEnd - 48h)
 * This ensures we never schedule in the past and handle short trials gracefully
 * @param trialEnd - The trial end date in UTC
 * @param timezoneOffsetMinutes - User's timezone offset (for logging/debugging)
 * @returns The calculated egress trigger time in UTC
 */
export function calculateEgressTrigger(trialEnd: Date, timezoneOffsetMinutes: number): Date {
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
  const fortyEightHoursBeforeTrialEnd = new Date(trialEnd.getTime() - 48 * 60 * 60 * 1000);
  
  // Return the maximum (latest) of the two times
  return new Date(Math.max(fiveMinutesFromNow.getTime(), fortyEightHoursBeforeTrialEnd.getTime()));
}

/**
 * Generates a unique magic hash for one-click cancellation
 * @returns A hex-encoded random string
 */
export function generateMagicHash(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Formats a date for display in the user's timezone
 * @param date - The date to format
 * @param timezoneOffsetMinutes - Timezone offset in minutes
 * @returns Formatted date string
 */
export function formatDateForTimezone(date: Date, timezoneOffsetMinutes: number): string {
  const localDate = utcToLocal(date, timezoneOffsetMinutes);
  return localDate.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
}

/**
 * Calculates time remaining until a date
 * @param targetDate - The target date
 * @returns Object with days, hours, minutes
 */
export function calculateTimeRemaining(targetDate: Date): {
  days: number;
  hours: number;
  minutes: number;
  totalHours: number;
} {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, totalHours: 0 };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const totalHours = Math.floor(diff / (1000 * 60 * 60));
  
  return { days, hours, minutes, totalHours };
}

/**
 * Gets timezone offset in minutes from browser
 * @returns Timezone offset in minutes
 */
export function getTimezoneOffsetMinutes(): number {
  return -new Date().getTimezoneOffset();
}

