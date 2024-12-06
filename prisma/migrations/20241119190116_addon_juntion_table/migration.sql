/*
  Warnings:

  - You are about to drop the column `addonId` on the `AddonGroup` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AddonGroup" DROP CONSTRAINT "AddonGroup_addonId_fkey";

-- AlterTable
ALTER TABLE "AddonGroup" DROP COLUMN "addonId";

-- CreateTable
CREATE TABLE "AddonToGroup" (
    "id" TEXT NOT NULL,
    "addonId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "maxQuantity" INTEGER NOT NULL DEFAULT 1,
    "minQuantity" INTEGER NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "extraPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AddonToGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AddonToGroup_addonId_groupId_key" ON "AddonToGroup"("addonId", "groupId");

-- AddForeignKey
ALTER TABLE "AddonToGroup" ADD CONSTRAINT "AddonToGroup_addonId_fkey" FOREIGN KEY ("addonId") REFERENCES "Addon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddonToGroup" ADD CONSTRAINT "AddonToGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "AddonGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
