-- Validate contact details at the database boundary as a final safeguard.
ALTER TABLE contact_messages
  DROP CONSTRAINT IF EXISTS contact_messages_phone_check,
  ADD CONSTRAINT contact_messages_phone_check
    CHECK (phone IS NULL OR phone ~ '^\+[1-9][0-9]{6,14}$') NOT VALID,
  DROP CONSTRAINT IF EXISTS contact_messages_email_check,
  ADD CONSTRAINT contact_messages_email_check
    CHECK (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$') NOT VALID;
