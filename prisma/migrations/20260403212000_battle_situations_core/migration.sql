-- CreateTable
CREATE TABLE "public"."battle_situations" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "scene_json" JSONB NOT NULL,
    "semantic_json" JSONB NOT NULL,
    "created_by_id" UUID NOT NULL,
    "updated_by_id" UUID NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "battle_situations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "battle_situations_created_by_id_idx" ON "public"."battle_situations"("created_by_id");

-- CreateIndex
CREATE INDEX "battle_situations_deleted_at_idx" ON "public"."battle_situations"("deleted_at");

-- CreateIndex
CREATE INDEX "battle_situations_updated_at_idx" ON "public"."battle_situations"("updated_at");

-- AddForeignKey
ALTER TABLE "public"."battle_situations"
ADD CONSTRAINT "battle_situations_created_by_id_fkey"
FOREIGN KEY ("created_by_id") REFERENCES "public"."user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."battle_situations"
ADD CONSTRAINT "battle_situations_updated_by_id_fkey"
FOREIGN KEY ("updated_by_id") REFERENCES "public"."user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."battle_situations"
ADD CONSTRAINT "battle_situations_deleted_by_id_fkey"
FOREIGN KEY ("deleted_by_id") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Note: RLS/auth-schema policies intentionally omitted.
-- Access control is enforced at the application layer.
