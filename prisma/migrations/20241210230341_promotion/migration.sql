/*
  Warnings:

  - You are about to drop the column `code` on the `Promotion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[promoCode]` on the table `Promotion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `promoCode` to the `Promotion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ALL', 'NEW_USER', 'EXISTING_USER', 'VIP');

-- DropIndex
DROP INDEX "Promotion_code_key";

-- AlterTable
ALTER TABLE "Promotion" DROP COLUMN "code",
ADD COLUMN     "applicableItems" JSONB,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "displayLocation" TEXT,
ADD COLUMN     "excludedItems" JSONB,
ADD COLUMN     "maxUsagePerUser" INTEGER,
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "promoCode" TEXT NOT NULL,
ADD COLUMN     "promotionBannerId" TEXT,
ADD COLUMN     "redemptionHistory" JSONB,
ADD COLUMN     "terms" TEXT,
ADD COLUMN     "totalRedemptions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "userType" "UserType";

-- CreateTable
CREATE TABLE "UserPromotion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPromotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionBanner" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "deviceType" "DeviceType" NOT NULL,

    CONSTRAINT "PromotionBanner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPromotion_userId_promotionId_key" ON "UserPromotion"("userId", "promotionId");

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_promoCode_key" ON "Promotion"("promoCode");

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_promotionBannerId_fkey" FOREIGN KEY ("promotionBannerId") REFERENCES "PromotionBanner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPromotion" ADD CONSTRAINT "UserPromotion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPromotion" ADD CONSTRAINT "UserPromotion_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
