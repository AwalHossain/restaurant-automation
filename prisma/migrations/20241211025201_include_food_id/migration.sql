-- CreateTable
CREATE TABLE "_FoodToPromotion" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FoodToPromotion_AB_unique" ON "_FoodToPromotion"("A", "B");

-- CreateIndex
CREATE INDEX "_FoodToPromotion_B_index" ON "_FoodToPromotion"("B");

-- AddForeignKey
ALTER TABLE "_FoodToPromotion" ADD CONSTRAINT "_FoodToPromotion_A_fkey" FOREIGN KEY ("A") REFERENCES "Food"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FoodToPromotion" ADD CONSTRAINT "_FoodToPromotion_B_fkey" FOREIGN KEY ("B") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
