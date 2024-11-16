-- CreateEnum
CREATE TYPE "AddonCategory" AS ENUM ('TOPPING', 'SAUCE', 'SIDE', 'DRINK', 'EXTRA');

-- AlterTable
ALTER TABLE "Addon" ADD COLUMN     "allergens" TEXT[],
ADD COLUMN     "category" "AddonCategory",
ADD COLUMN     "image" TEXT,
ADD COLUMN     "nutritionInfo" JSONB,
ADD COLUMN     "preparationTime" INTEGER;

-- AlterTable
ALTER TABLE "FoodAddon" ADD COLUMN     "addonGroupId" TEXT,
ADD COLUMN     "defaultQuantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "minQuantity" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "FoodVariant" ADD COLUMN     "isRequired" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "AddonGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "maxSelectionsAllowed" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "AddonGroup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FoodAddon" ADD CONSTRAINT "FoodAddon_addonGroupId_fkey" FOREIGN KEY ("addonGroupId") REFERENCES "AddonGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
