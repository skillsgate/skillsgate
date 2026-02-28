-- CreateTable
CREATE TABLE "namespaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "namespaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_chunks" (
    "id" TEXT NOT NULL,
    "skill_id" TEXT NOT NULL,
    "chunk_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "namespace" TEXT NOT NULL DEFAULT 'public',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "namespace_access" (
    "id" TEXT NOT NULL,
    "namespace_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'reader',
    "granted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "namespace_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_skill_chunks_skill_id" ON "skill_chunks"("skill_id");

-- CreateIndex
CREATE INDEX "idx_skill_chunks_namespace" ON "skill_chunks"("namespace");

-- CreateIndex
CREATE UNIQUE INDEX "uq_namespace_access" ON "namespace_access"("namespace_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_namespace_access_user" ON "namespace_access"("user_id");

-- AddForeignKey
ALTER TABLE "skill_chunks" ADD CONSTRAINT "skill_chunks_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_chunks" ADD CONSTRAINT "skill_chunks_namespace_fkey" FOREIGN KEY ("namespace") REFERENCES "namespaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "namespaces" ADD CONSTRAINT "namespaces_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "namespace_access" ADD CONSTRAINT "namespace_access_namespace_id_fkey" FOREIGN KEY ("namespace_id") REFERENCES "namespaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "namespace_access" ADD CONSTRAINT "namespace_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column (1536 = text-embedding-3-small)
ALTER TABLE "skill_chunks" ADD COLUMN "embedding" vector(1536);

-- HNSW index for cosine similarity
CREATE INDEX idx_skill_chunks_embedding
  ON "skill_chunks"
  USING hnsw ("embedding" vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Partial index for public-only searches (anonymous users, most common path)
CREATE INDEX idx_skill_chunks_embedding_public
  ON "skill_chunks"
  USING hnsw ("embedding" vector_cosine_ops)
  WHERE namespace = 'public';
