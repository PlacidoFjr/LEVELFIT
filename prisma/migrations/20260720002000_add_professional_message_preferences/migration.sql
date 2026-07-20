ALTER TABLE "notification_preferences"
  ADD COLUMN IF NOT EXISTS "professional_messages_enabled" BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS "nutrition_pro_messages_enabled" BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS "run_pro_messages_enabled" BOOLEAN NOT NULL DEFAULT TRUE;
