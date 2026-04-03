-- Drop deleted-field foreign key/index/columns from battle_situations
ALTER TABLE "public"."battle_situations"
DROP CONSTRAINT IF EXISTS "battle_situations_deleted_by_id_fkey";

DROP INDEX IF EXISTS "public"."battle_situations_deleted_at_idx";

ALTER TABLE "public"."battle_situations"
DROP COLUMN IF EXISTS "deleted_by_id",
DROP COLUMN IF EXISTS "deleted_at";
