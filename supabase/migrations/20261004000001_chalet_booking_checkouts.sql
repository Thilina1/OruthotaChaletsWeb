-- Online (PayHere) chalet checkouts: a website booking that needs online
-- payment is kept here while the guest pays, and the chalet booking is
-- created (and the booking emails sent) only after PayHere confirms the
-- payment. While a checkout is awaiting payment (until expires_at) it holds
-- its room types for its dates.
--
-- The website uses only the public (anon) key, so everything goes through the
-- SECURITY DEFINER functions below. The PayHere notification is trusted only
-- when its signature matches the merchant secret stored in
-- chalet_private_settings (see the setup line at the end of this file).

CREATE TABLE IF NOT EXISTS public.chalet_booking_checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'awaiting_payment' CHECK (status IN (
    'awaiting_payment',  -- guest sent to PayHere
    'booked',            -- paid and booking created (booking_id)
    'payment_failed',    -- payment cancelled / failed / charged back
    'paid_unavailable',  -- paid, but the rooms were no longer available: refund needed
    'amount_mismatch'    -- paid amount/currency differs from the checkout: check manually
  )),
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  room_allocations JSONB NOT NULL DEFAULT '[]'::jsonb,
  booking_payload JSONB NOT NULL,
  email_details JSONB,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  booking_id UUID REFERENCES public.chalet_bookings(id) ON DELETE SET NULL,
  payhere_payment_id TEXT,
  payhere_status_code TEXT,
  payhere_status_message TEXT,
  payhere_method TEXT,
  payhere_amount NUMERIC,
  payhere_currency TEXT,
  error TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '5 minutes'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chalet_booking_checkouts_holds_idx
  ON public.chalet_booking_checkouts (status, check_in_date, check_out_date);

-- Server-only settings (the PayHere merchant secret). Not readable by anyone
-- except the functions below.
CREATE TABLE IF NOT EXISTS public.chalet_private_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chalet_booking_checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chalet_private_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.chalet_booking_checkouts FROM anon, authenticated;
REVOKE ALL ON public.chalet_private_settings FROM anon, authenticated;

-- First room type in p_allocations that does not have enough free chalets on
-- these dates. Every booking except cancelled ones holds its dates, plus
-- checkouts still awaiting payment (except p_exclude_checkout).
CREATE OR REPLACE FUNCTION public.chalet_room_type_shortage(
  p_check_in DATE,
  p_check_out DATE,
  p_allocations JSONB,
  p_exclude_checkout UUID DEFAULT NULL
)
RETURNS TABLE (category_id TEXT, available INTEGER)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  requested RECORD;
  free_rooms INTEGER;
  held INTEGER;
BEGIN
  FOR requested IN
    SELECT allocation->>'roomCategoryId' AS cat, COUNT(*)::INTEGER AS wanted
    FROM jsonb_array_elements(COALESCE(p_allocations, '[]'::jsonb)) AS allocation
    WHERE allocation->>'roomCategoryId' IS NOT NULL
    GROUP BY 1
  LOOP
    SELECT COUNT(*)::INTEGER INTO free_rooms
    FROM public.chalet_rooms room
    WHERE room.category_id::TEXT = requested.cat
      AND room.status = 'available'
      AND NOT EXISTS (
        SELECT 1 FROM public.chalet_bookings booking
        WHERE booking.status <> 'cancelled'
          AND booking.check_in_date < p_check_out
          AND booking.check_out_date > p_check_in
          AND (booking.room_id = room.id OR room.id = ANY(COALESCE(booking.room_ids, '{}'::uuid[])))
      );

    SELECT COALESCE(SUM(
      CASE
        WHEN jsonb_typeof(booking.room_allocations) = 'array' AND jsonb_array_length(booking.room_allocations) > 0 THEN
          (SELECT COUNT(*) FROM jsonb_array_elements(booking.room_allocations) AS allocation
           WHERE allocation->>'roomCategoryId' = requested.cat)
        WHEN booking.room_category_id::TEXT = requested.cat
          AND booking.room_id IS NULL
          AND COALESCE(array_length(booking.room_ids, 1), 0) = 0 THEN 1
        ELSE 0
      END
    ), 0)::INTEGER INTO held
    FROM public.chalet_bookings booking
    WHERE booking.status <> 'cancelled'
      AND booking.check_in_date < p_check_out
      AND booking.check_out_date > p_check_in;

    held := held + (
      SELECT COUNT(*)::INTEGER
      FROM public.chalet_booking_checkouts checkout,
        jsonb_array_elements(checkout.room_allocations) AS allocation
      WHERE checkout.status = 'awaiting_payment'
        AND checkout.expires_at > now()
        AND checkout.check_in_date < p_check_out
        AND checkout.check_out_date > p_check_in
        AND (p_exclude_checkout IS NULL OR checkout.id <> p_exclude_checkout)
        AND allocation->>'roomCategoryId' = requested.cat
    );

    IF GREATEST(0, free_rooms - held) < requested.wanted THEN
      category_id := requested.cat;
      available := GREATEST(0, free_rooms - held);
      RETURN NEXT;
      RETURN;
    END IF;
  END LOOP;
END;
$$;

-- Saves a checkout (holding its rooms) after checking they are available.
-- Returns the checkout ID, used as the PayHere order ID.
CREATE OR REPLACE FUNCTION public.create_chalet_checkout(
  p_booking JSONB,
  p_email_details JSONB,
  p_amount NUMERIC,
  p_currency TEXT,
  p_hold_minutes INTEGER DEFAULT 5
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  check_in DATE := (p_booking->>'check_in_date')::DATE;
  check_out DATE := (p_booking->>'check_out_date')::DATE;
  allocations JSONB := COALESCE(p_booking->'room_allocations', '[]'::jsonb);
  shortage RECORD;
  checkout_id UUID;
BEGIN
  IF check_in IS NULL OR check_out IS NULL OR check_out <= check_in THEN
    RAISE EXCEPTION 'INVALID_DATES';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 OR p_currency NOT IN ('LKR', 'USD') THEN
    RAISE EXCEPTION 'INVALID_AMOUNT';
  END IF;

  -- One availability decision at a time, so two guests cannot take the last room.
  PERFORM pg_advisory_xact_lock(hashtext('chalet_room_availability'));
  SELECT * INTO shortage FROM public.chalet_room_type_shortage(check_in, check_out, allocations) LIMIT 1;
  IF FOUND THEN
    RAISE EXCEPTION 'ROOMS_UNAVAILABLE:%:%', shortage.category_id, shortage.available;
  END IF;

  INSERT INTO public.chalet_booking_checkouts (
    check_in_date, check_out_date, room_allocations, booking_payload, email_details, amount, currency, expires_at
  ) VALUES (
    check_in, check_out, allocations, p_booking, p_email_details, ROUND(p_amount, 2), p_currency,
    now() + make_interval(mins => GREATEST(1, LEAST(COALESCE(p_hold_minutes, 5), 30)))
  )
  RETURNING id INTO checkout_id;
  RETURN checkout_id;
END;
$$;

-- Status of a checkout (and its booking number once booked), for the page the
-- guest returns to from PayHere.
CREATE OR REPLACE FUNCTION public.get_chalet_checkout_status(p_checkout_id UUID)
RETURNS TABLE (status TEXT, booking_ref TEXT)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT checkout.status, booking.booking_ref
  FROM public.chalet_booking_checkouts checkout
  LEFT JOIN public.chalet_bookings booking ON booking.id = checkout.booking_id
  WHERE checkout.id = p_checkout_id;
$$;

-- Room types held by checkouts awaiting payment (dates and room types only),
-- so the website's availability counts include them.
CREATE OR REPLACE FUNCTION public.get_chalet_checkout_holds(p_check_in DATE, p_check_out DATE)
RETURNS TABLE (check_in_date DATE, check_out_date DATE, room_allocations JSONB)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT checkout.check_in_date, checkout.check_out_date, checkout.room_allocations
  FROM public.chalet_booking_checkouts checkout
  WHERE checkout.status = 'awaiting_payment'
    AND checkout.expires_at > now()
    AND checkout.check_in_date < p_check_out
    AND checkout.check_out_date > p_check_in;
$$;

-- PayHere payment notification. Trusted only when md5sig matches the stored
-- merchant secret. On a successful payment it re-checks availability, creates
-- the booking as paid and posts the payment, all in one transaction; repeated
-- notifications do not create a second booking.
CREATE OR REPLACE FUNCTION public.chalet_payhere_notify(
  p_merchant_id TEXT,
  p_order_id TEXT,
  p_payhere_amount TEXT,
  p_payhere_currency TEXT,
  p_status_code TEXT,
  p_md5sig TEXT,
  p_payment_id TEXT DEFAULT NULL,
  p_method TEXT DEFAULT NULL,
  p_status_message TEXT DEFAULT NULL,
  p_environment TEXT DEFAULT 'sandbox'
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  merchant_secret TEXT;
  checkout_id UUID;
  checkout public.chalet_booking_checkouts%ROWTYPE;
  shortage RECORD;
  payload JSONB;
  column_list TEXT;
  new_booking_id UUID;
  new_booking_ref TEXT;
BEGIN
  SELECT value INTO merchant_secret FROM public.chalet_private_settings WHERE key = 'payhere_merchant_secret';
  IF merchant_secret IS NULL OR merchant_secret = '' THEN
    RAISE EXCEPTION 'PAYHERE_SECRET_NOT_SET';
  END IF;
  IF UPPER(COALESCE(p_md5sig, '')) <> UPPER(md5(
    COALESCE(p_merchant_id, '') || COALESCE(p_order_id, '') || COALESCE(p_payhere_amount, '') ||
    COALESCE(p_payhere_currency, '') || COALESCE(p_status_code, '') || UPPER(md5(merchant_secret))
  )) THEN
    RAISE EXCEPTION 'INVALID_SIGNATURE';
  END IF;

  BEGIN
    checkout_id := p_order_id::UUID;
  EXCEPTION WHEN others THEN
    RETURN jsonb_build_object('status', 'not_found');
  END;

  PERFORM pg_advisory_xact_lock(hashtext('chalet_room_availability'));
  SELECT * INTO checkout FROM public.chalet_booking_checkouts WHERE id = checkout_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'not_found');
  END IF;

  UPDATE public.chalet_booking_checkouts SET
    payhere_payment_id = COALESCE(p_payment_id, payhere_payment_id),
    payhere_status_code = p_status_code,
    payhere_status_message = p_status_message,
    payhere_method = COALESCE(p_method, payhere_method),
    payhere_amount = NULLIF(p_payhere_amount, '')::NUMERIC,
    payhere_currency = p_payhere_currency,
    updated_at = now()
  WHERE id = checkout_id;

  IF checkout.status = 'booked' THEN
    RETURN jsonb_build_object('status', 'already_processed');
  END IF;

  IF p_status_code <> '2' THEN
    IF checkout.status = 'awaiting_payment' AND p_status_code IN ('-1', '-2', '-3') THEN
      UPDATE public.chalet_booking_checkouts SET status = 'payment_failed' WHERE id = checkout_id;
    END IF;
    RETURN jsonb_build_object('status', 'not_paid');
  END IF;

  IF checkout.status NOT IN ('awaiting_payment', 'payment_failed') THEN
    RETURN jsonb_build_object('status', 'already_processed');
  END IF;

  IF ABS(checkout.amount - NULLIF(p_payhere_amount, '')::NUMERIC) > 0.01 OR checkout.currency <> p_payhere_currency THEN
    UPDATE public.chalet_booking_checkouts
    SET status = 'amount_mismatch',
        error = format('Paid %s %s, expected %s %s', p_payhere_currency, p_payhere_amount, checkout.currency, checkout.amount)
    WHERE id = checkout_id;
    RETURN jsonb_build_object('status', 'amount_mismatch');
  END IF;

  SELECT * INTO shortage
  FROM public.chalet_room_type_shortage(checkout.check_in_date, checkout.check_out_date, checkout.room_allocations, checkout_id)
  LIMIT 1;
  IF FOUND THEN
    UPDATE public.chalet_booking_checkouts
    SET status = 'paid_unavailable', error = 'Rooms no longer available after payment. Refund needed.'
    WHERE id = checkout_id;
    RETURN jsonb_build_object('status', 'paid_unavailable');
  END IF;

  payload := checkout.booking_payload || jsonb_build_object(
    'payment_status', 'paid',
    'amount_paid', NULLIF(p_payhere_amount, '')::NUMERIC,
    'payment_gateway', 'payhere',
    'payment_environment', CASE WHEN p_environment = 'live' THEN 'live' ELSE 'sandbox' END,
    'payhere_order_id', p_order_id,
    'payhere_payment_id', p_payment_id,
    'payhere_status_code', p_status_code,
    'payhere_status_message', p_status_message,
    'payhere_method', p_method,
    'payhere_amount', NULLIF(p_payhere_amount, '')::NUMERIC,
    'payhere_currency', p_payhere_currency,
    'payhere_received_at', now()
  );

  -- Insert only the columns present in the payload, so the table's defaults
  -- (id, booking_ref, created_at, ...) still apply.
  SELECT string_agg(quote_ident(key), ', ') INTO column_list
  FROM jsonb_object_keys(payload) AS key
  WHERE EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'chalet_bookings' AND column_name = key
  );
  EXECUTE format(
    'INSERT INTO public.chalet_bookings (%1$s) SELECT %1$s FROM jsonb_populate_record(NULL::public.chalet_bookings, $1) RETURNING id, booking_ref',
    column_list
  ) USING payload INTO new_booking_id, new_booking_ref;

  UPDATE public.chalet_booking_checkouts
  SET status = 'booked', booking_id = new_booking_id, error = NULL
  WHERE id = checkout_id;

  BEGIN
    PERFORM public.post_chalet_online_payment(new_booking_id);
  EXCEPTION WHEN others THEN
    UPDATE public.chalet_booking_checkouts SET error = 'Payment posting failed: ' || SQLERRM WHERE id = checkout_id;
  END;

  RETURN jsonb_build_object(
    'status', 'booked',
    'booking_id', new_booking_id,
    'booking_ref', new_booking_ref,
    'email_details', checkout.email_details
  );
END;
$$;

REVOKE ALL ON FUNCTION public.chalet_room_type_shortage(DATE, DATE, JSONB, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_chalet_checkout(JSONB, JSONB, NUMERIC, TEXT, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_chalet_checkout_status(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_chalet_checkout_holds(DATE, DATE) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.chalet_payhere_notify(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- SETUP (run once in the Supabase SQL editor, with your real PayHere merchant
-- secret — the same value as PAYHERE_MERCHANT_SECRET; never commit it):
--
-- INSERT INTO public.chalet_private_settings (key, value)
-- VALUES ('payhere_merchant_secret', 'YOUR_PAYHERE_MERCHANT_SECRET')
-- ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
