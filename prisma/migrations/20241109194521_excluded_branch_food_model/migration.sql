/*
  Warnings:

  - You are about to drop the `BranchFood` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BranchFood" DROP CONSTRAINT "BranchFood_branchId_fkey";

-- DropForeignKey
ALTER TABLE "BranchFood" DROP CONSTRAINT "BranchFood_foodId_fkey";

-- DropTable
DROP TABLE "BranchFood";

-- CreateTable
CREATE TABLE "_BranchFood" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BranchFood_AB_unique" ON "_BranchFood"("A", "B");

-- CreateIndex
CREATE INDEX "_BranchFood_B_index" ON "_BranchFood"("B");

-- AddForeignKey
ALTER TABLE "_BranchFood" ADD CONSTRAINT "_BranchFood_A_fkey" FOREIGN KEY ("A") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BranchFood" ADD CONSTRAINT "_BranchFood_B_fkey" FOREIGN KEY ("B") REFERENCES "Food"("id") ON DELETE CASCADE ON UPDATE CASCADE;
