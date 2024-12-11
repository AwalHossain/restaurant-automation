/*
  Warnings:

  - You are about to drop the column `promotionBannerId` on the `Promotion` table. All the data in the column will be lost.
  - Added the required column `promotionId` to the `PromotionBanner` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Promotion" DROP CONSTRAINT "Promotion_promotionBannerId_fkey";

-- AlterTable
ALTER TABLE "Promotion" DROP COLUMN "promotionBannerId";

-- AlterTable
ALTER TABLE "PromotionBanner" ADD COLUMN     "promotionId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "PromotionBanner" ADD CONSTRAINT "PromotionBanner_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
