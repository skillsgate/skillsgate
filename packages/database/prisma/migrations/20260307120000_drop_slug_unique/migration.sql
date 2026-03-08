-- Drop the unique constraint on skills.slug
-- sourceId is now the canonical unique identifier for skills
DROP INDEX IF EXISTS "skills_slug_key";
