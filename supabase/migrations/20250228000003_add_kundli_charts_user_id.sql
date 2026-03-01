-- Add optional user ownership for kundli_charts (nullable so anonymous charts remain valid).
ALTER TABLE kundli_charts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_kundli_charts_user_id ON kundli_charts(user_id);
