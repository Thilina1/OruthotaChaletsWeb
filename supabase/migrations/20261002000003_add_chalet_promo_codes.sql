CREATE TABLE IF NOT EXISTS public.chalet_promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  currency TEXT NOT NULL DEFAULT 'both' CHECK (currency IN ('LKR', 'USD', 'both')),
  min_room_total NUMERIC NOT NULL DEFAULT 0,
  starts_at DATE,
  ends_at DATE,
  max_uses INT,
  used_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chalet_promo_codes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'chalet_promo_codes'
      AND policyname = 'public read active promo codes'
  ) THEN
    CREATE POLICY "public read active promo codes"
      ON public.chalet_promo_codes
      FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

ALTER TABLE public.chalet_bookings
  ADD COLUMN IF NOT EXISTS promo_code TEXT,
  ADD COLUMN IF NOT EXISTS promo_discount NUMERIC NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_chalet_promo_usage(promo_code_text TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.chalet_promo_codes
  SET used_count = used_count + 1,
      updated_at = NOW()
  WHERE code = upper(btrim(promo_code_text))
    AND is_active = true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_chalet_promo_usage(TEXT) TO anon, authenticated;
