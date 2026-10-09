ALTER TABLE public.chalet_bookings
  ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES public.chalet_rooms(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS room_ids UUID[] NOT NULL DEFAULT '{}'::uuid[];

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE INDEX IF NOT EXISTS chalet_bookings_room_id_idx
  ON public.chalet_bookings (room_id);

CREATE INDEX IF NOT EXISTS chalet_bookings_room_ids_gin_idx
  ON public.chalet_bookings
  USING GIN (room_ids);

CREATE INDEX IF NOT EXISTS chalet_bookings_category_dates_active_idx
  ON public.chalet_bookings (room_category_id, check_in_date, check_out_date)
  WHERE status IN ('pending', 'confirmed', 'checked_in');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chalet_bookings_no_room_overlap'
      AND conrelid = 'public.chalet_bookings'::regclass
  ) THEN
    ALTER TABLE public.chalet_bookings
      ADD CONSTRAINT chalet_bookings_no_room_overlap
      EXCLUDE USING gist (
        room_id WITH =,
        daterange(check_in_date, check_out_date, '[)') WITH &&
      )
      WHERE (
        room_id IS NOT NULL
        AND status IN ('pending', 'confirmed', 'checked_in')
      );
  END IF;
END $$;
