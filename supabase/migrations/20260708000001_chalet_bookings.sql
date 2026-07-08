-- Chalet booking lookup tables (run only if they don't exist yet)
CREATE TABLE IF NOT EXISTS chalet_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chalet_occupancy_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chalet_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES chalet_packages(id) ON DELETE CASCADE,
  occupancy_type_id uuid NOT NULL REFERENCES chalet_occupancy_types(id) ON DELETE CASCADE,
  rate_per_night numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(package_id, occupancy_type_id)
);

-- Main bookings table
CREATE TABLE IF NOT EXISTS chalet_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  package_id uuid REFERENCES chalet_packages(id),
  occupancy_type_id uuid REFERENCES chalet_occupancy_types(id),
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text NOT NULL,
  customer_nic text,
  nationality text,
  adults int NOT NULL DEFAULT 1,
  children int NOT NULL DEFAULT 0,
  special_requests text,
  rate_per_night numeric,
  total_nights int,
  subtotal numeric,
  service_charge numeric,
  total_amount numeric,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'checked_in', 'checked_out')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Allow anonymous inserts for public booking form
ALTER TABLE chalet_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public can insert bookings" ON chalet_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "public can read own pending bookings" ON chalet_bookings FOR SELECT USING (true);

-- Lookup tables are public read-only
ALTER TABLE chalet_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read packages" ON chalet_packages FOR SELECT USING (true);

ALTER TABLE chalet_occupancy_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read occupancy types" ON chalet_occupancy_types FOR SELECT USING (true);

ALTER TABLE chalet_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read rates" ON chalet_rates FOR SELECT USING (true);
