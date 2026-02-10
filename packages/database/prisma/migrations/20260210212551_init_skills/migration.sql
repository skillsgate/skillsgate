-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "source_type" TEXT NOT NULL DEFAULT 'direct',
    "github_repo" TEXT,
    "github_path" TEXT,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "vectorized_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMPTZ,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "skills_slug_key" ON "skills"("slug");

-- CreateIndex
CREATE INDEX "idx_skills_github" ON "skills"("github_repo", "github_path");

-- CreateIndex
CREATE INDEX "idx_skills_downloads" ON "skills"("downloads" DESC);

-- CreateIndex
CREATE INDEX "idx_skills_created" ON "skills"("created_at" DESC);
