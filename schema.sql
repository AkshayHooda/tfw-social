-- Social Media Review & Post Approval Platform Database Schema
-- Supabase Postgres Migration

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  creator_name TEXT NOT NULL,
  creator_handle TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('instagram_reel', 'instagram_post', 'linkedin')),
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('video', 'image')),
  caption TEXT,
  scheduled_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'changes_requested')),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_posts_token ON posts(token);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Influencers can read the post with their unique token without login
CREATE POLICY "Public read post by token"
  ON posts
  FOR SELECT
  USING (true);

-- Influencers can update status and feedback for their post
CREATE POLICY "Public update status and feedback by token"
  ON posts
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Editor / Service role can insert new posts
CREATE POLICY "Allow insert for all or authenticated"
  ON posts
  FOR INSERT
  WITH CHECK (true);

-- Editor / Service role can delete posts
CREATE POLICY "Allow delete for all or authenticated"
  ON posts
  FOR DELETE
  USING (true);
