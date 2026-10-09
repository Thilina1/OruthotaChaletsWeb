ALTER TABLE public.chalet_rooms ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'chalet_rooms'
          AND policyname = 'public read chalet rooms'
    ) THEN
        CREATE POLICY "public read chalet rooms"
            ON public.chalet_rooms
            FOR SELECT
            USING (true);
    END IF;
END $$;
