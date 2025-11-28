import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors
let supabaseInstance: SupabaseClient | null = null;
let supabaseAdminInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL and anon key are required. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
    }
    
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

function getSupabaseAdminClient(): SupabaseClient {
  if (!supabaseAdminInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase URL and service role key are required. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }
    
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return supabaseAdminInstance;
}

// Client for client-side operations (uses anon key)
// Exported for potential client-side use, but functions use getSupabaseClient()
export const supabase = getSupabaseClient();

// Admin client for server-side operations (uses service role key)
// Exported for potential direct use, but functions use getSupabaseAdminClient()
export const supabaseAdmin = getSupabaseAdminClient();

export type ReminderStatus = 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';

export interface Reminder {
  id: string;
  user_email: string;
  service_name: string;
  trial_end_utc: string;
  egress_trigger_utc: string;
  status: ReminderStatus;
  timezone_offset: number;
  magic_hash: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReminderInput {
  user_email: string;
  service_name: string;
  trial_end_utc: Date;
  egress_trigger_utc: Date;
  timezone_offset: number;
  magic_hash: string;
}

/**
 * Creates a new reminder in the database
 */
export async function createReminder(input: CreateReminderInput): Promise<Reminder> {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from('reminders')
    .insert({
      user_email: input.user_email.trim().toLowerCase(),
      service_name: input.service_name.trim(),
      trial_end_utc: input.trial_end_utc.toISOString(),
      egress_trigger_utc: input.egress_trigger_utc.toISOString(),
      timezone_offset: input.timezone_offset,
      magic_hash: input.magic_hash,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create reminder: ${error.message}`);
  }

  return data as Reminder;
}

/**
 * Gets all pending reminders that are ready to be sent
 * (egress_trigger_utc <= NOW() and status = 'pending')
 */
export async function getPendingReminders(): Promise<Reminder[]> {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from('reminders')
    .select('*')
    .eq('status', 'pending')
    .lte('egress_trigger_utc', new Date().toISOString())
    .order('egress_trigger_utc', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch pending reminders: ${error.message}`);
  }

  return (data || []) as Reminder[];
}

/**
 * Updates the status of a reminder (with atomic lock for processing)
 */
export async function updateReminderStatus(
  id: string,
  status: ReminderStatus
): Promise<Reminder> {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from('reminders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update reminder status: ${error.message}`);
  }

  return data as Reminder;
}

/**
 * Marks a reminder as processing (atomic lock to prevent double-sends)
 * Only updates if current status is 'pending'
 */
export async function lockReminderForProcessing(id: string): Promise<Reminder | null> {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from('reminders')
    .update({ status: 'processing' })
    .eq('id', id)
    .eq('status', 'pending') // Only update if still pending
    .select()
    .single();

  if (error) {
    // If no rows updated, it means another process already locked it
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to lock reminder: ${error.message}`);
  }

  return data as Reminder;
}

/**
 * Gets a reminder by magic hash (for cancellation)
 */
export async function getReminderByMagicHash(magicHash: string): Promise<Reminder | null> {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from('reminders')
    .select('*')
    .eq('magic_hash', magicHash)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch reminder: ${error.message}`);
  }

  return data as Reminder;
}

/**
 * Cancels a reminder by setting status to 'cancelled'
 */
export async function cancelReminder(id: string): Promise<Reminder> {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from('reminders')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to cancel reminder: ${error.message}`);
  }

  return data as Reminder;
}

