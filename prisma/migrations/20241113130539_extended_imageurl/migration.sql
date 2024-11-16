/*
  Warnings:

  - You are about to drop the column `image` on the `Addon` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Addon" DROP COLUMN "image",
ADD COLUMN     "imageSize" INTEGER,
ADD COLUMN     "imageUrl" TEXT;
