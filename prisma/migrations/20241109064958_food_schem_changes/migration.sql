/*
  Warnings:

  - You are about to drop the column `price` on the `FoodVariant` table. All the data in the column will be lost.
  - Added the required column `basePrice` to the `FoodVariant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Food" DROP CONSTRAINT "Food_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Food" DROP CONSTRAINT "Food_updatedById_fkey";

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "discountPercentage" DECIMAL(5,2);

-- AlterTable
ALTER TABLE "Food" ALTER COLUMN "isPopular" DROP NOT NULL,
ALTER COLUMN "isRecommended" DROP NOT NULL,
ALTER COLUMN "isNewArrival" DROP NOT NULL,
ALTER COLUMN "createdById" DROP NOT NULL,
ALTER COLUMN "updatedById" DROP NOT NULL,
ALTER COLUMN "dynamicHome" DROP NOT NULL,
ALTER COLUMN "freeDelivery" DROP NOT NULL,
ALTER COLUMN "haveDiscount" DROP NOT NULL,
ALTER COLUMN "isDefaultImage" DROP NOT NULL,
ALTER COLUMN "isFeatured" DROP NOT NULL,
ALTER COLUMN "isFree" DROP NOT NULL,
ALTER COLUMN "minOrderQuantity" DROP NOT NULL,
ALTER COLUMN "specialDeliveryFee" DROP NOT NULL,
ALTER COLUMN "topSnacks" DROP NOT NULL,
ALTER COLUMN "trending" DROP NOT NULL;

-- AlterTable
ALTER TABLE "FoodVariant" DROP COLUMN "price",
ADD COLUMN     "basePrice" DECIMAL(10,2) NOT NULL;

-- AddForeignKey
ALTER TABLE "Food" ADD CONSTRAINT "Food_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Food" ADD CONSTRAINT "Food_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
