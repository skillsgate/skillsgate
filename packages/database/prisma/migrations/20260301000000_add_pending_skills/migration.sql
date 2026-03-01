-- CreateTable
CREATE TABLE "pending_skills" (
    "id" TEXT NOT NULL,
    "github_url" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "submitted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "pending_skills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pending_skills_github_url_key" ON "pending_skills"("github_url");
