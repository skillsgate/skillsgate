-- CreateTable
CREATE TABLE "community_scans" (
    "id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "skill_id" TEXT,
    "content_hash" TEXT NOT NULL,
    "scanner_type" TEXT NOT NULL,
    "risk" TEXT NOT NULL,
    "summary" TEXT,
    "findings" JSONB NOT NULL DEFAULT '[]',
    "finding_count" INTEGER NOT NULL DEFAULT 0,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_scans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "community_scans_source_id_idx" ON "community_scans"("source_id");

-- CreateIndex
CREATE INDEX "community_scans_skill_id_idx" ON "community_scans"("skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "community_scans_source_id_user_id_content_hash_key" ON "community_scans"("source_id", "user_id", "content_hash");

-- AddForeignKey
ALTER TABLE "community_scans" ADD CONSTRAINT "community_scans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
