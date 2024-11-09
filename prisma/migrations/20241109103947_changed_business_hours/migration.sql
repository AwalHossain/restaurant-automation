/*
  Warnings:

  - You are about to drop the column `closingTime` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `coordinates` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `openingTime` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `closeTime` on the `BusinessHours` table. All the data in the column will be lost.
  - You are about to drop the column `openTime` on the `BusinessHours` table. All the data in the column will be lost.
  - Added the required column `closingTime` to the `BusinessHours` table without a default value. This is not possible if the table is not empty.
  - Added the required column `openingTime` to the `BusinessHours` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Branch" DROP COLUMN "closingTime",
DROP COLUMN "coordinates",
DROP COLUMN "openingTime",
ADD COLUMN     "latitude" TEXT,
ADD COLUMN     "longitude" TEXT;

-- AlterTable
ALTER TABLE "BusinessHours" DROP COLUMN "closeTime",
DROP COLUMN "openTime",
ADD COLUMN     "closingTime" TEXT NOT NULL,
ADD COLUMN     "openingTime" TEXT NOT NULL,
ALTER COLUMN "dayOfWeek" SET DATA TYPE TEXT;
