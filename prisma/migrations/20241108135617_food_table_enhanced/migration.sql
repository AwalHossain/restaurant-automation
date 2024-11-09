/*
  Warnings:

  - You are about to drop the column `image` on the `Food` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('MOBILE', 'TABLET', 'DESKTOP');

-- CreateEnum
CREATE TYPE "FoodStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('SEASONAL', 'FESTIVAL', 'FLASH_SALE', 'NEW_LAUNCH', 'FEATURED');

-- AlterTable
ALTER TABLE "Food" DROP COLUMN "image",
ADD COLUMN     "availableEndTime" TEXT,
ADD COLUMN     "availableStartTime" TEXT,
ADD COLUMN     "campaignId" TEXT,
ADD COLUMN     "discountedPrice" DECIMAL(10,2),
ADD COLUMN     "dynamicHome" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "expiryDate" TIMESTAMP(3),
ADD COLUMN     "freeDelivery" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "haveDiscount" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isDefaultImage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFree" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "minOrderQuantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "offer" TEXT,
ADD COLUMN     "specialDeliveryFee" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "topSnacks" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trending" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trendingEndTime" TEXT,
ADD COLUMN     "trendingStartTime" TEXT;

-- CreateTable
CREATE TABLE "FoodImage" (
    "id" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "deviceType" "DeviceType" NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FoodImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "type" "CampaignType" NOT NULL,
    "bannerImage" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FoodImage_foodId_deviceType_key" ON "FoodImage"("foodId", "deviceType");

-- CreateIndex
CREATE INDEX "Food_topSnacks_idx" ON "Food"("topSnacks");

-- CreateIndex
CREATE INDEX "Food_trending_idx" ON "Food"("trending");

-- CreateIndex
CREATE INDEX "Food_dynamicHome_idx" ON "Food"("dynamicHome");

-- CreateIndex
CREATE INDEX "Food_isFeatured_idx" ON "Food"("isFeatured");

-- AddForeignKey
ALTER TABLE "Food" ADD CONSTRAINT "Food_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodImage" ADD CONSTRAINT "FoodImage_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
