-- Create GitHub App installations table
CREATE TABLE "github_installations" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "installation_id" TEXT NOT NULL,
  "account_login" TEXT,
  "account_type" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "github_installations_pkey" PRIMARY KEY ("id")
);

-- Indexes and constraints
CREATE UNIQUE INDEX "uq_github_installations_user_installation" ON "github_installations"("user_id", "installation_id");
CREATE INDEX "idx_github_installations_user" ON "github_installations"("user_id");

-- Foreign key
ALTER TABLE "github_installations"
  ADD CONSTRAINT "github_installations_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
