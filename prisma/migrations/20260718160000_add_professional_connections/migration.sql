-- CreateEnum
CREATE TYPE "ProfessionalKind" AS ENUM ('nutrition', 'run');

-- CreateEnum
CREATE TYPE "ProfessionalConnectionStatus" AS ENUM ('active', 'revoked');

-- CreateTable
CREATE TABLE "professional_invites" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(32) NOT NULL,
    "kind" "ProfessionalKind" NOT NULL,
    "professional_key" VARCHAR(80) NOT NULL,
    "professional_name" VARCHAR(120) NOT NULL,
    "professional_role" VARCHAR(120) NOT NULL,
    "headline" VARCHAR(160) NOT NULL,
    "plan_title" VARCHAR(160) NOT NULL,
    "default_permissions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "professional_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professional_connections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "invite_id" UUID,
    "kind" "ProfessionalKind" NOT NULL,
    "professional_key" VARCHAR(80) NOT NULL,
    "professional_name" VARCHAR(120) NOT NULL,
    "professional_role" VARCHAR(120) NOT NULL,
    "status" "ProfessionalConnectionStatus" NOT NULL DEFAULT 'active',
    "permissions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "plan_title" VARCHAR(160) NOT NULL,
    "next_event_label" VARCHAR(160),
    "notes" VARCHAR(500),
    "accepted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "professional_connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "professional_invites_code_key" ON "professional_invites"("code");

-- CreateIndex
CREATE INDEX "professional_invites_kind_is_active_idx" ON "professional_invites"("kind", "is_active");

-- CreateIndex
CREATE INDEX "professional_invites_professional_key_idx" ON "professional_invites"("professional_key");

-- CreateIndex
CREATE UNIQUE INDEX "professional_connections_user_id_professional_key_kind_key" ON "professional_connections"("user_id", "professional_key", "kind");

-- CreateIndex
CREATE INDEX "professional_connections_user_id_status_idx" ON "professional_connections"("user_id", "status");

-- CreateIndex
CREATE INDEX "professional_connections_kind_professional_key_idx" ON "professional_connections"("kind", "professional_key");

-- AddForeignKey
ALTER TABLE "professional_connections" ADD CONSTRAINT "professional_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_connections" ADD CONSTRAINT "professional_connections_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "professional_invites"("id") ON DELETE SET NULL ON UPDATE CASCADE;
