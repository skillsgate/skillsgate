-- Add source_id column to skills table for stable source-based identity
ALTER TABLE "skills" ADD COLUMN "source_id" TEXT;

-- Add unique constraint on source_id
CREATE UNIQUE INDEX "skills_source_id_key" ON "skills"("source_id");

-- Add index for lookups
CREATE INDEX "idx_skills_source_id" ON "skills"("source_id");
