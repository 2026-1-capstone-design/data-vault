-- AlterTable
ALTER TABLE "public"."battle_situations"
ADD COLUMN "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN "ally_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "enemy_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "total_count" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "battle_situations_ally_count_idx" ON "public"."battle_situations"("ally_count");

-- CreateIndex
CREATE INDEX "battle_situations_enemy_count_idx" ON "public"."battle_situations"("enemy_count");

-- CreateIndex
CREATE INDEX "battle_situations_total_count_idx" ON "public"."battle_situations"("total_count");
