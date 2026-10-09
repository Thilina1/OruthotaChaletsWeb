-- Lets the website's server complete a paid checkout with the Supabase service
-- role key, after checking PayHere's signature itself (with
-- PAYHERE_MERCHANT_SECRET). With this, the PayHere merchant secret does not
-- need to be stored in the database. chalet_payhere_notify (public key,
-- signature checked in the database) keeps working and uses the same steps.

-- Completes a checkout after PayHere's notification: on a successful payment
-- re-checks availability, creates the booking as paid and posts the payment,
-- all in one transaction; repeated notifications do not create a second
-- booking. Only the service role may call it (the caller has verified the
-- PayHere signature).
CREATE OR REPLACE FUNCTION public.chalet_complete_checkout_payment(
  p_order_id TEXT,
  p_payhere_amount TEXT,
  p_payhere_currency TEXT,
  p_status_code TEXT,
  p_payment_id TEXT DEFAULT NULL,
  p_method TEXT DEFAULT NULL,
  p_status_message TEXT DEFAULT NULL,
  p_environment TEXT DEFAULT 'sandbox'
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  checkout_id UUID;
  checkout public.chalet_booking_checkouts%ROWTYPE;
  shortage RECORD;
  payload JSONB;
  column_list TEXT;
  new_booking_id UUID;
  new_booking_ref TEXT;
BEGIN
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

-- Public-key version: checks PayHere's signature against the merchant secret
-- stored in chalet_private_settings, then completes the checkout.
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
  RETURN public.chalet_complete_checkout_payment(
    p_order_id, p_payhere_amount, p_payhere_currency, p_status_code,
    p_payment_id, p_method, p_status_message, p_environment
  );
END;
$$;

REVOKE ALL ON FUNCTION public.chalet_complete_checkout_payment(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.chalet_complete_checkout_payment(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.chalet_payhere_notify(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
