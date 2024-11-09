-- CreateEnum
CREATE TYPE "restaurantType" AS ENUM ('FAST_FOOD', 'FINE_DINING', 'CAFE');

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "address" TEXT,
ADD COLUMN     "deliveryAreas" JSONB,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "openDate" TIMESTAMP(3),
ADD COLUMN     "ratings" DECIMAL(3,2),
ADD COLUMN     "socialMediaLinks" JSONB;

-- AlterTable
ALTER TABLE "RestaurantSettings" ADD COLUMN     "acceptsPreorders" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "currencySymbol" TEXT,
ADD COLUMN     "customerSupportEmail" TEXT,
ADD COLUMN     "deliveryTimeEstimate" INTEGER,
ADD COLUMN     "lastUpdatedById" TEXT,
ADD COLUMN     "paymentMethods" JSONB,
ADD COLUMN     "restaurantType" "restaurantType",
ADD COLUMN     "serviceChargePercentage" DECIMAL(5,2),
ADD COLUMN     "timezoneOffset" INTEGER;

-- AddForeignKey
ALTER TABLE "RestaurantSettings" ADD CONSTRAINT "RestaurantSettings_lastUpdatedById_fkey" FOREIGN KEY ("lastUpdatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
