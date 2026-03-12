-- Drop the composite unique constraint on (publisher_id, slug)
-- sourceId is now the canonical unique identifier for skills
DROP INDEX IF EXISTS "idx_skills_publisher_slug";
