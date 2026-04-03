-- Remove deleted fields from idea tables
DROP INDEX IF EXISTS "public"."weapon_ideas_deleted_at_idx";
DROP INDEX IF EXISTS "public"."skill_ideas_deleted_at_idx";
DROP INDEX IF EXISTS "public"."perk_ideas_deleted_at_idx";
DROP INDEX IF EXISTS "public"."gladiator_name_ideas_deleted_at_idx";

ALTER TABLE "public"."weapon_ideas"
DROP COLUMN IF EXISTS "deleted_at";

ALTER TABLE "public"."skill_ideas"
DROP COLUMN IF EXISTS "deleted_at";

ALTER TABLE "public"."perk_ideas"
DROP COLUMN IF EXISTS "deleted_at";

ALTER TABLE "public"."gladiator_name_ideas"
DROP COLUMN IF EXISTS "deleted_at";
