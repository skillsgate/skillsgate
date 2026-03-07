-- CreateTable: discovered_repos
CREATE TABLE "discovered_repos" (
    "id" TEXT NOT NULL,
    "github_owner" TEXT NOT NULL,
    "github_repo" TEXT NOT NULL,
    "default_branch" TEXT NOT NULL DEFAULT 'main',
    "source" TEXT NOT NULL DEFAULT 'csv_import',
    "discovery_status" TEXT NOT NULL DEFAULT 'pending',
    "skill_count" INTEGER NOT NULL DEFAULT 0,
    "last_discovered_at" TIMESTAMPTZ,
    "discovery_error" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discovered_repos_pkey" PRIMARY KEY ("id")
);

-- CreateTable: vectorization_requests
CREATE TABLE "vectorization_requests" (
    "id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "github_owner" TEXT NOT NULL,
    "github_repo" TEXT NOT NULL,
    "github_path" TEXT NOT NULL,
    "github_ref" TEXT,
    "discovered_repo_id" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vectorization_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: unique constraint on discovered_repos(github_owner, github_repo)
CREATE UNIQUE INDEX "discovered_repos_github_owner_github_repo_key" ON "discovered_repos"("github_owner", "github_repo");

-- CreateIndex: discovery status lookup
CREATE INDEX "idx_discovered_repos_status" ON "discovered_repos"("discovery_status");

-- CreateIndex: unique constraint on vectorization_requests(source_id)
CREATE UNIQUE INDEX "vectorization_requests_source_id_key" ON "vectorization_requests"("source_id");

-- CreateIndex: status lookup
CREATE INDEX "idx_vectorization_requests_status" ON "vectorization_requests"("status");

-- CreateIndex: drain index for dispatch (higher priority first, oldest first within same priority, only pending)
CREATE INDEX "idx_vectorization_requests_drain"
    ON "vectorization_requests"("priority" DESC, "created_at" ASC)
    WHERE "status" = 'pending';

-- AddForeignKey: vectorization_requests.discovered_repo_id -> discovered_repos.id
ALTER TABLE "vectorization_requests"
    ADD CONSTRAINT "vectorization_requests_discovered_repo_id_fkey"
    FOREIGN KEY ("discovered_repo_id") REFERENCES "discovered_repos"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- CHECK constraints Prisma cannot express
ALTER TABLE "discovered_repos"
    ADD CONSTRAINT "chk_discovered_repos_status"
    CHECK ("discovery_status" IN ('pending', 'discovering', 'discovered', 'failed', 'not_found'));

ALTER TABLE "vectorization_requests"
    ADD CONSTRAINT "chk_vectorization_requests_status"
    CHECK ("status" IN ('pending', 'processing', 'completed', 'failed'));

-- System user for bulk imports (vectorization workflow requires publisherId FK to users)
INSERT INTO "users" ("id", "name", "email", "email_verified")
VALUES ('system', 'SkillsGate System', 'system@skillsgate.ai', true)
ON CONFLICT ("id") DO NOTHING;
