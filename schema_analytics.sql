-- Schema Extension: Analytics, Performance Tracking & AI Summaries
-- "The Finance Woman" Reporting Module

-- 1. Extend posts table with live tracking & metrics
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS live_post_url TEXT,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS views INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS likes INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS shares INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS metrics_updated_at TIMESTAMPTZ;

-- 2. Performance Summaries Table (AI Executive Briefings)
CREATE TABLE IF NOT EXISTS performance_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_name TEXT NOT NULL,
  summary_text TEXT NOT NULL,
  best_performing_platform TEXT,
  top_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_posts_is_published ON posts(is_published);
CREATE INDEX IF NOT EXISTS idx_posts_live_post_url ON posts(live_post_url);
CREATE INDEX IF NOT EXISTS idx_performance_summaries_creator ON performance_summaries(creator_name);
CREATE INDEX IF NOT EXISTS idx_performance_summaries_generated ON performance_summaries(generated_at DESC);

-- 4. RLS for performance summaries
ALTER TABLE performance_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read performance summaries"
  ON performance_summaries
  FOR SELECT
  USING (true);

CREATE POLICY "Allow insert performance summaries"
  ON performance_summaries
  FOR INSERT
  WITH CHECK (true);
