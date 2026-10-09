-- Lock down public access to guest/customer and booking data.
-- Public visitors may submit form records, but must not be able to read,
-- update, or delete booking/customer records from the browser.

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'chalet_bookings',
    'reservations',
    'guests',
    'table_bookings',
    'contact_messages'
  ]
  LOOP
    IF to_regclass(format('public.%I', table_name)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
      EXECUTE format('REVOKE SELECT, UPDATE, DELETE ON public.%I FROM anon, authenticated', table_name);
    END IF;
  END LOOP;
END $$;

DROP POLICY IF EXISTS "public can read own pending bookings" ON public.chalet_bookings;

DROP POLICY IF EXISTS "public can insert bookings" ON public.chalet_bookings;
CREATE POLICY "anon can submit chalet booking requests"
  ON public.chalet_bookings
  FOR INSERT
  TO anon
  WITH CHECK (
    status = 'pending'
    AND check_in_date < check_out_date
    AND customer_name = btrim(customer_name)
    AND customer_name <> ''
    AND customer_phone = btrim(customer_phone)
    AND customer_phone <> ''
    AND adults BETWEEN 1 AND 20
    AND children BETWEEN 0 AND 20
  );

REVOKE ALL ON public.chalet_bookings FROM anon;
    GRANT INSERT (
      check_in_date,
      check_out_date,
      package_id,
      occupancy_type_id,
      customer_name,
      customer_email,
      customer_phone,
      customer_nic,
      nationality,
      adults,
      children,
      special_requests
    ) ON public.chalet_bookings TO anon;

DO $$
BEGIN
  IF to_regclass('public.contact_messages') IS NOT NULL THEN
    DROP POLICY IF EXISTS "anon can submit contact messages" ON public.contact_messages;
    CREATE POLICY "anon can submit contact messages"
      ON public.contact_messages
      FOR INSERT
      TO anon
      WITH CHECK (
        name = btrim(name)
        AND name <> ''
        AND email = btrim(email)
        AND email <> ''
        AND inquiry_type IN ('general', 'experience')
        AND status = 'pending'
      );

    REVOKE ALL ON public.contact_messages FROM anon;
    GRANT INSERT (
      name,
      email,
      phone,
      subject,
      message,
      inquiry_type,
      experience_type,
      status
    ) ON public.contact_messages TO anon;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.table_bookings') IS NOT NULL THEN
    DROP POLICY IF EXISTS "anon can submit table booking requests" ON public.table_bookings;
    CREATE POLICY "anon can submit table booking requests"
      ON public.table_bookings
      FOR INSERT
      TO anon
      WITH CHECK (
        name = btrim(name)
        AND name <> ''
        AND phone = btrim(phone)
        AND phone <> ''
        AND guests BETWEEN 1 AND 50
      );

    REVOKE ALL ON public.table_bookings FROM anon;
    GRANT INSERT (
      name,
      email,
      phone,
      date,
      meal_type,
      guests,
      comments
    ) ON public.table_bookings TO anon;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.guests') IS NOT NULL THEN
    DROP POLICY IF EXISTS "anon can create guest profiles" ON public.guests;
    CREATE POLICY "anon can create guest profiles"
      ON public.guests
      FOR INSERT
      TO anon
      WITH CHECK (
        first_name = btrim(first_name)
        AND first_name <> ''
        AND last_name = btrim(last_name)
        AND last_name <> ''
        AND email = btrim(email)
        AND email <> ''
      );

    REVOKE ALL ON public.guests FROM anon;
    GRANT INSERT (
      first_name,
      last_name,
      email,
      phone_number,
      id_card_number
    ) ON public.guests TO anon;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.reservations') IS NOT NULL THEN
    DROP POLICY IF EXISTS "anon can submit reservation requests" ON public.reservations;
    CREATE POLICY "anon can submit reservation requests"
      ON public.reservations
      FOR INSERT
      TO anon
      WITH CHECK (
        check_in_date < check_out_date
        AND guest_name = btrim(guest_name)
        AND guest_name <> ''
        AND guest_email = btrim(guest_email)
        AND guest_email <> ''
        AND number_of_guests BETWEEN 1 AND 50
        AND status = 'pending'
      );

    REVOKE ALL ON public.reservations FROM anon;
    GRANT INSERT (
      guest_id,
      room_id,
      room_title,
      guest_name,
      guest_email,
      check_in_date,
      check_out_date,
      number_of_guests,
      special_requests,
      id_card_number,
      guest_phone
    ) ON public.reservations TO anon;
  END IF;
END $$;
