-- AlterTable: Add new columns to skills
ALTER TABLE "skills" ADD COLUMN "visibility" TEXT NOT NULL DEFAULT 'public';
ALTER TABLE "skills" ADD COLUMN "publisher_id" TEXT;
ALTER TABLE "skills" ADD COLUMN "org_id" TEXT;
ALTER TABLE "skills" ADD COLUMN "connected_repo_id" TEXT;
ALTER TABLE "skills" ADD COLUMN "price_cents" INTEGER;

-- AlterTable: Add granted_by to namespace_access
ALTER TABLE "namespace_access" ADD COLUMN "granted_by" TEXT;

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "billing_email" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "private_skill_limit" INTEGER NOT NULL DEFAULT 5,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_members" (
    "org_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("org_id","user_id")
);

-- CreateTable
CREATE TABLE "connected_repos" (
    "id" TEXT NOT NULL,
    "org_id" TEXT,
    "user_id" TEXT,
    "github_owner" TEXT NOT NULL,
    "github_repo" TEXT NOT NULL,
    "github_branch" TEXT NOT NULL DEFAULT 'main',
    "github_installation_id" TEXT,
    "skill_count" INTEGER NOT NULL DEFAULT 0,
    "last_synced_at" TIMESTAMPTZ,
    "sync_status" TEXT NOT NULL DEFAULT 'pending',
    "sync_error" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "connected_repos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" TEXT NOT NULL,
    "namespace_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "stripe_payment_id" TEXT,
    "purchased_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "connected_repos_github_owner_github_repo_key" ON "connected_repos"("github_owner", "github_repo");

-- CreateIndex
CREATE UNIQUE INDEX "purchases_namespace_id_user_id_key" ON "purchases"("namespace_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_skills_publisher" ON "skills"("publisher_id");

-- CreateIndex
CREATE INDEX "idx_skills_org" ON "skills"("org_id");

-- AddForeignKey: skills.publisher_id -> users.id
ALTER TABLE "skills" ADD CONSTRAINT "skills_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: skills.org_id -> organizations.id
ALTER TABLE "skills" ADD CONSTRAINT "skills_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: skills.connected_repo_id -> connected_repos.id
ALTER TABLE "skills" ADD CONSTRAINT "skills_connected_repo_id_fkey" FOREIGN KEY ("connected_repo_id") REFERENCES "connected_repos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: namespace_access.granted_by -> users.id
ALTER TABLE "namespace_access" ADD CONSTRAINT "namespace_access_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: organization_members.org_id -> organizations.id
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: organization_members.user_id -> users.id
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: connected_repos.org_id -> organizations.id
ALTER TABLE "connected_repos" ADD CONSTRAINT "connected_repos_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: connected_repos.user_id -> users.id
ALTER TABLE "connected_repos" ADD CONSTRAINT "connected_repos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: purchases.namespace_id -> namespaces.id
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_namespace_id_fkey" FOREIGN KEY ("namespace_id") REFERENCES "namespaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: purchases.user_id -> users.id
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CHECK constraints Prisma cannot express
ALTER TABLE "organizations" ADD CONSTRAINT "chk_org_plan" CHECK ("plan" IN ('free', 'team', 'enterprise'));
ALTER TABLE "organization_members" ADD CONSTRAINT "chk_orgmember_role" CHECK ("role" IN ('owner', 'admin', 'member'));
ALTER TABLE "connected_repos" ADD CONSTRAINT "chk_repo_sync_status" CHECK ("sync_status" IN ('pending', 'syncing', 'synced', 'error'));
ALTER TABLE "connected_repos" ADD CONSTRAINT "chk_repo_has_owner" CHECK ("org_id" IS NOT NULL OR "user_id" IS NOT NULL);
ALTER TABLE "skills" ADD CONSTRAINT "chk_skill_visibility" CHECK ("visibility" IN ('public', 'private', 'premium'));
