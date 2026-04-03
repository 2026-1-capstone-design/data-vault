-- CreateEnum
CREATE TYPE "public"."RoleName" AS ENUM ('admin', 'editor');

-- CreateTable
CREATE TABLE "public"."user_profiles" (
    "id" UUID NOT NULL,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" TEXT NOT NULL,
    "name" "public"."RoleName" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_roles" (
    "user_id" UUID NOT NULL,
    "role_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id", "role_id")
);

-- CreateTable
CREATE TABLE "public"."weapon_ideas" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" UUID NOT NULL,

    CONSTRAINT "weapon_ideas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."skill_ideas" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" UUID NOT NULL,

    CONSTRAINT "skill_ideas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."perk_ideas" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" UUID NOT NULL,

    CONSTRAINT "perk_ideas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gladiator_name_ideas" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" UUID NOT NULL,

    CONSTRAINT "gladiator_name_ideas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_email_key" ON "public"."user_profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "public"."roles"("name");

-- CreateIndex
CREATE INDEX "user_roles_role_id_idx" ON "public"."user_roles"("role_id");

-- CreateIndex
CREATE INDEX "weapon_ideas_created_by_id_idx" ON "public"."weapon_ideas"("created_by_id");

-- CreateIndex
CREATE INDEX "weapon_ideas_deleted_at_idx" ON "public"."weapon_ideas"("deleted_at");

-- CreateIndex
CREATE INDEX "skill_ideas_created_by_id_idx" ON "public"."skill_ideas"("created_by_id");

-- CreateIndex
CREATE INDEX "skill_ideas_deleted_at_idx" ON "public"."skill_ideas"("deleted_at");

-- CreateIndex
CREATE INDEX "perk_ideas_created_by_id_idx" ON "public"."perk_ideas"("created_by_id");

-- CreateIndex
CREATE INDEX "perk_ideas_deleted_at_idx" ON "public"."perk_ideas"("deleted_at");

-- CreateIndex
CREATE INDEX "gladiator_name_ideas_created_by_id_idx" ON "public"."gladiator_name_ideas"("created_by_id");

-- CreateIndex
CREATE INDEX "gladiator_name_ideas_deleted_at_idx" ON "public"."gladiator_name_ideas"("deleted_at");

-- AddForeignKey
ALTER TABLE "public"."user_roles"
ADD CONSTRAINT "user_roles_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles"
ADD CONSTRAINT "user_roles_role_id_fkey"
FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."weapon_ideas"
ADD CONSTRAINT "weapon_ideas_created_by_id_fkey"
FOREIGN KEY ("created_by_id") REFERENCES "public"."user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."skill_ideas"
ADD CONSTRAINT "skill_ideas_created_by_id_fkey"
FOREIGN KEY ("created_by_id") REFERENCES "public"."user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."perk_ideas"
ADD CONSTRAINT "perk_ideas_created_by_id_fkey"
FOREIGN KEY ("created_by_id") REFERENCES "public"."user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gladiator_name_ideas"
ADD CONSTRAINT "gladiator_name_ideas_created_by_id_fkey"
FOREIGN KEY ("created_by_id") REFERENCES "public"."user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Note: RLS/auth-schema policies intentionally omitted.
-- Access control is enforced at the application layer.
