CREATE TYPE "UserAccessRole" AS ENUM ('OWNER', 'NUTRITIONIST', 'RUN_COACH');

CREATE TABLE "user_role_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "role" "UserAccessRole" NOT NULL,
    "source" VARCHAR(32) NOT NULL DEFAULT 'manual',
    "assigned_by_user_id" UUID,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_role_assignments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "user_role_assignments_user_id_role_revoked_at_idx" ON "user_role_assignments"("user_id", "role", "revoked_at");
CREATE INDEX "user_role_assignments_role_revoked_at_idx" ON "user_role_assignments"("role", "revoked_at");

ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_assigned_by_user_id_fkey" FOREIGN KEY ("assigned_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
