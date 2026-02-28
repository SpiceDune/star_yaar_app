-- Panchang table: one row per date (reference location = Delhi)
-- Data from 1970-01-01 to 2040-12-31 for daily panchang at sunrise (Udaya Tithi).
CREATE TABLE IF NOT EXISTS panchang (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  tithi TEXT NOT NULL,
  nakshatra TEXT NOT NULL,
  nakshatra_pada SMALLINT,
  yoga TEXT,
  karana TEXT,
  vara TEXT NOT NULL,
  vara_english TEXT,
  lagna TEXT,
  lagna_english TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_panchang_date ON panchang (date);

COMMENT ON TABLE panchang IS 'Daily panchang (tithi, nakshatra, yoga, karana, vara) at reference location; 1970-2040';
