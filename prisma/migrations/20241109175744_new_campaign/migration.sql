/*
  Warnings:

  - The values [FLASH_SALE,NEW_LAUNCH,FEATURED] on the enum `CampaignType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `bannerImage` on the `Campaign` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CampaignType_new" AS ENUM ('SEASONAL', 'FESTIVAL', 'HAPPY_HOUR', 'WEEKEND_SPECIAL', 'NEW_MENU_ITEM', 'BOGO', 'LOYALTY_REWARD', 'HOLIDAY', 'FAMILY_PACKAGE', 'DELIVERY_ONLY', 'IN_STORE_ONLY');
ALTER TABLE "Campaign" ALTER COLUMN "type" TYPE "CampaignType_new" USING ("type"::text::"CampaignType_new");
ALTER TYPE "CampaignType" RENAME TO "CampaignType_old";
ALTER TYPE "CampaignType_new" RENAME TO "CampaignType";
DROP TYPE "CampaignType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "bannerImage",
ADD COLUMN     "budget" DECIMAL(10,2),
ADD COLUMN     "conditions" JSONB,
ADD COLUMN     "displayLocation" TEXT,
ADD COLUMN     "promoCode" TEXT,
ADD COLUMN     "redemptionLimit" INTEGER,
ADD COLUMN     "targetAudience" JSONB;

-- CreateTable
CREATE TABLE "CampaignImage" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "deviceType" "DeviceType" NOT NULL,

    CONSTRAINT "CampaignImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CampaignImage" ADD CONSTRAINT "CampaignImage_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
