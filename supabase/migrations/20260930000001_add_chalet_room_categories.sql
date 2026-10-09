CREATE TABLE IF NOT EXISTS public.chalet_room_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE,
    description TEXT,
    area_sqm NUMERIC(8,2),
    room_count INT NOT NULL DEFAULT 1,
    max_adults INT NOT NULL DEFAULT 2,
    max_children INT NOT NULL DEFAULT 0,
    max_guests INT NOT NULL DEFAULT 2,
    bed_configurations JSONB NOT NULL DEFAULT '[]'::jsonb,
    bathroom_features JSONB NOT NULL DEFAULT '[]'::jsonb,
    entertainment_features JSONB NOT NULL DEFAULT '[]'::jsonb,
    general_amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
    internet_features JSONB NOT NULL DEFAULT '[]'::jsonb,
    image_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chalet_rates
    ADD COLUMN IF NOT EXISTS room_category_id UUID REFERENCES public.chalet_room_categories(id) ON DELETE CASCADE;

ALTER TABLE public.chalet_bookings
    ADD COLUMN IF NOT EXISTS room_category_id UUID REFERENCES public.chalet_room_categories(id) ON DELETE SET NULL;

ALTER TABLE public.chalet_rates
    ALTER COLUMN occupancy_type_id DROP NOT NULL;

DROP INDEX IF EXISTS chalet_rates_default_package_occupancy_key;
DROP INDEX IF EXISTS chalet_rates_category_package_occupancy_key;
DROP INDEX IF EXISTS chalet_rates_package_id_occupancy_type_id_key;
ALTER TABLE public.chalet_rates
    DROP CONSTRAINT IF EXISTS chalet_rates_package_id_occupancy_type_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS chalet_rates_default_package_key
    ON public.chalet_rates (package_id)
    WHERE room_category_id IS NULL AND occupancy_type_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS chalet_rates_category_package_key
    ON public.chalet_rates (room_category_id, package_id)
    WHERE room_category_id IS NOT NULL AND occupancy_type_id IS NULL;

ALTER TABLE public.chalet_room_categories ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'chalet_room_categories'
          AND policyname = 'public read room categories'
    ) THEN
        CREATE POLICY "public read room categories" ON public.chalet_room_categories FOR SELECT USING (true);
    END IF;
END $$;
