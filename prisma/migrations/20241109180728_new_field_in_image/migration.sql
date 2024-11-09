/*
  Warnings:

  - Added the required column `height` to the `CampaignImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `CampaignImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `CampaignImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CampaignImage" ADD COLUMN     "height" INTEGER NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL,
ADD COLUMN     "width" INTEGER NOT NULL;
