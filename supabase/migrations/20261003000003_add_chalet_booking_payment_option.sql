ALTER TABLE public.chalet_bookings
  ADD COLUMN IF NOT EXISTS payment_option TEXT NOT NULL DEFAULT 'full' CHECK (payment_option IN ('half', 'full')),
  ADD COLUMN IF NOT EXISTS payment_required_amount NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_balance_amount NUMERIC NOT NULL DEFAULT 0;
