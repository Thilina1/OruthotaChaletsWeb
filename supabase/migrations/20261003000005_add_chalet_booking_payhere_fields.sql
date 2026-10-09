ALTER TABLE public.chalet_bookings
  ADD COLUMN IF NOT EXISTS payment_gateway TEXT,
  ADD COLUMN IF NOT EXISTS payment_environment TEXT,
  ADD COLUMN IF NOT EXISTS payhere_order_id TEXT,
  ADD COLUMN IF NOT EXISTS payhere_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS payhere_status_code TEXT,
  ADD COLUMN IF NOT EXISTS payhere_status_message TEXT,
  ADD COLUMN IF NOT EXISTS payhere_method TEXT,
  ADD COLUMN IF NOT EXISTS payhere_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS payhere_currency TEXT,
  ADD COLUMN IF NOT EXISTS payhere_received_at TIMESTAMPTZ;
