/*
  Warnings:

  - You are about to drop the `AddonGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AddonToGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FoodAddonGroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AddonGroup" DROP CONSTRAINT "AddonGroup_createdById_fkey";

-- DropForeignKey
ALTER TABLE "AddonGroup" DROP CONSTRAINT "AddonGroup_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "AddonToGroup" DROP CONSTRAINT "AddonToGroup_addonId_fkey";

-- DropForeignKey
ALTER TABLE "AddonToGroup" DROP CONSTRAINT "AddonToGroup_groupId_fkey";

-- DropForeignKey
ALTER TABLE "FoodAddonGroup" DROP CONSTRAINT "FoodAddonGroup_addonGroupId_fkey";

-- DropForeignKey
ALTER TABLE "FoodAddonGroup" DROP CONSTRAINT "FoodAddonGroup_foodId_fkey";

-- DropTable
DROP TABLE "AddonGroup";

-- DropTable
DROP TABLE "AddonToGroup";

-- DropTable
DROP TABLE "FoodAddonGroup";

-- CreateTable
CREATE TABLE "FoodAddon" (
    "id" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "addonId" TEXT NOT NULL,
    "maxSelections" INTEGER NOT NULL DEFAULT 1,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodAddon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FoodAddon_foodId_addonId_key" ON "FoodAddon"("foodId", "addonId");

-- AddForeignKey
ALTER TABLE "FoodAddon" ADD CONSTRAINT "FoodAddon_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodAddon" ADD CONSTRAINT "FoodAddon_addonId_fkey" FOREIGN KEY ("addonId") REFERENCES "Addon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
