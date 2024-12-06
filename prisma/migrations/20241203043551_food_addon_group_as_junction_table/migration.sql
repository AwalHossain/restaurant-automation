/*
  Warnings:

  - You are about to drop the `FoodAddon` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FoodAddon" DROP CONSTRAINT "FoodAddon_addonGroupId_fkey";

-- DropForeignKey
ALTER TABLE "FoodAddon" DROP CONSTRAINT "FoodAddon_addonId_fkey";

-- DropForeignKey
ALTER TABLE "FoodAddon" DROP CONSTRAINT "FoodAddon_foodId_fkey";

-- DropTable
DROP TABLE "FoodAddon";

-- CreateTable
CREATE TABLE "FoodAddonGroup" (
    "id" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "maxSelectionsAllowed" INTEGER NOT NULL DEFAULT 1,
    "addonGroupId" TEXT NOT NULL,

    CONSTRAINT "FoodAddonGroup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FoodAddonGroup" ADD CONSTRAINT "FoodAddonGroup_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodAddonGroup" ADD CONSTRAINT "FoodAddonGroup_addonGroupId_fkey" FOREIGN KEY ("addonGroupId") REFERENCES "AddonGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
