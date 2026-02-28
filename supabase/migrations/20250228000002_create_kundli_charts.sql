-- Kundli charts table: stores computed birth chart data for sharing and caching.
CREATE TABLE kundli_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  dob DATE NOT NULL,
  time_of_birth TEXT,
  city TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  timezone TEXT,
  chart_data JSONB NOT NULL,
  dasha_data JSONB NOT NULL,
  panchang_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_kundli_charts_dob_lat_lon ON kundli_charts (dob, latitude, longitude);

COMMENT ON TABLE kundli_charts IS 'Cached kundli computations keyed by UUID for sharing and avoiding recomputation';
