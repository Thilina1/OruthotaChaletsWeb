-- Validate the existing phone column as an international phone number.
ALTER TABLE contact_messages
  DROP CONSTRAINT IF EXISTS contact_messages_phone_check,
  ADD CONSTRAINT contact_messages_phone_check
    CHECK (phone IS NULL OR phone ~ '^\+[1-9][0-9]{4,14}$') NOT VALID;
