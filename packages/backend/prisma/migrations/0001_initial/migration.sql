-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ChecklistStatus" AS ENUM ('in_progress', 'complete');

-- CreateEnum
CREATE TYPE "CheckStatus" AS ENUM ('pending', 'ready', 'not_ready', 'confirm_set_up', 'check_manually', 'failed');

-- CreateTable
CREATE TABLE "stores" (
    "id" UUID NOT NULL,
    "store_id" BIGINT NOT NULL,
    "access_token" TEXT NOT NULL,
    "scope" TEXT,
    "token_type" VARCHAR(50),
    "user_id" BIGINT,
    "installed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklists" (
    "id" UUID NOT NULL,
    "store_id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "status" "ChecklistStatus" NOT NULL DEFAULT 'in_progress',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_checks" (
    "id" UUID NOT NULL,
    "checklist_id" UUID NOT NULL,
    "store_id" BIGINT NOT NULL,
    "check_type" VARCHAR(100) NOT NULL,
    "status" "CheckStatus" NOT NULL DEFAULT 'pending',
    "detailed_findings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_checks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stores_store_id_key" ON "stores"("store_id");

-- CreateIndex
CREATE INDEX "checklists_store_id_created_at_idx" ON "checklists"("store_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "checklist_checks_checklist_id_check_type_idx" ON "checklist_checks"("checklist_id", "check_type");

-- CreateIndex
CREATE INDEX "checklist_checks_store_id_checklist_id_idx" ON "checklist_checks"("store_id", "checklist_id");

-- AddForeignKey
ALTER TABLE "checklist_checks" ADD CONSTRAINT "checklist_checks_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

