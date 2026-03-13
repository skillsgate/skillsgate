-- Migration: Add favorites table
-- Date: 2026-03-12

CREATE TABLE favorites (
  id         TEXT        NOT NULL PRIMARY KEY,
  user_id    TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id   TEXT        NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint: one favorite per user per skill
CREATE UNIQUE INDEX uq_favorites_user_skill ON favorites (user_id, skill_id);

-- Index for listing a user's favorites
CREATE INDEX idx_favorites_user ON favorites (user_id);

-- Index for counting favorites per skill
CREATE INDEX idx_favorites_skill ON favorites (skill_id);
