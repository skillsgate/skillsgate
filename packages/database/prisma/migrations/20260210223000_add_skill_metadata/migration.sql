-- AlterTable
ALTER TABLE "skills"
ADD COLUMN     "summary" text,
ADD COLUMN     "categories" jsonb,
ADD COLUMN     "capabilities" jsonb,
ADD COLUMN     "keywords" jsonb,
ADD COLUMN     "content_hash" text,
ADD COLUMN     "has_scripts" boolean DEFAULT false NOT NULL,
ADD COLUMN     "has_references" boolean DEFAULT false NOT NULL;
