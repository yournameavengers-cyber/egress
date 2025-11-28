-- Create status enum type
CREATE TYPE reminder_status AS ENUM ('pending', 'processing', 'sent', 'failed', 'cancelled');

-- Create reminders table
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR(255) NOT NULL,
  service_name VARCHAR(100) NOT NULL,
  trial_end_utc TIMESTAMPTZ NOT NULL,
  egress_trigger_utc TIMESTAMPTZ NOT NULL,
  status reminder_status NOT NULL DEFAULT 'pending',
  timezone_offset INTEGER NOT NULL,
  magic_hash VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_reminders_user_email ON reminders(user_email);
CREATE INDEX idx_reminders_egress_trigger_utc ON reminders(egress_trigger_utc);
CREATE INDEX idx_reminders_status ON reminders(status);
CREATE INDEX idx_reminders_magic_hash ON reminders(magic_hash);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate magic hash (for reference, actual generation happens in application code)
-- This is just a helper function if needed
CREATE OR REPLACE FUNCTION generate_magic_hash()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

