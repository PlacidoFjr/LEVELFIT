-- Add public food database and itemized food log entries.
CREATE TABLE "foods" (
    "id" UUID NOT NULL,
    "taco_code" INTEGER,
    "name" VARCHAR(180) NOT NULL,
    "search_name" VARCHAR(220) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "kcal_per_100g" INTEGER,
    "protein_g_per_100g" DECIMAL(7,2),
    "carbs_g_per_100g" DECIMAL(7,2),
    "fat_g_per_100g" DECIMAL(7,2),
    "fiber_g_per_100g" DECIMAL(7,2),
    "source" VARCHAR(120) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "foods_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "food_log_items" (
    "id" UUID NOT NULL,
    "food_log_id" UUID NOT NULL,
    "food_id" UUID,
    "name_snapshot" VARCHAR(180) NOT NULL,
    "quantity_g" DECIMAL(7,2) NOT NULL,
    "calories" INTEGER,
    "protein_g" DECIMAL(7,2),
    "carbs_g" DECIMAL(7,2),
    "fat_g" DECIMAL(7,2),
    "fiber_g" DECIMAL(7,2),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "food_log_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "foods_taco_code_key" ON "foods"("taco_code");
CREATE INDEX "foods_search_name_idx" ON "foods"("search_name");
CREATE INDEX "foods_category_idx" ON "foods"("category");
CREATE INDEX "food_log_items_food_log_id_idx" ON "food_log_items"("food_log_id");
CREATE INDEX "food_log_items_food_id_idx" ON "food_log_items"("food_id");

ALTER TABLE "food_log_items" ADD CONSTRAINT "food_log_items_food_log_id_fkey" FOREIGN KEY ("food_log_id") REFERENCES "food_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "food_log_items" ADD CONSTRAINT "food_log_items_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "foods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
