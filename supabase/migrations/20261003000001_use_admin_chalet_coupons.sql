CREATE TABLE IF NOT EXISTS public.chalet_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'fixed' CHECK (discount_type IN ('fixed', 'percentage')),
  discount_value NUMERIC NOT NULL DEFAULT 0 CHECK (discount_value >= 0),
  max_discount_amount NUMERIC,
  min_bill_amount NUMERIC NOT NULL DEFAULT 0,
  max_bill_amount NUMERIC,
  valid_from DATE,
  valid_to DATE,
  max_usage INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.chalet_bookings
  ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES public.chalet_coupons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS coupon_code TEXT,
  ADD COLUMN IF NOT EXISTS coupon_discount_amount NUMERIC NOT NULL DEFAULT 0;

ALTER TABLE public.chalet_coupons ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'chalet_coupons'
      AND policyname = 'public read active chalet coupons'
  ) THEN
    CREATE POLICY "public read active chalet coupons"
      ON public.chalet_coupons
      FOR SELECT
      USING (is_active = true);
  END IF;
END $$;
