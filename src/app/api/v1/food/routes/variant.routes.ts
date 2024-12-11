import { Router } from "express";
import { VariantControllerFactory } from "../factories/controller.factory";

const variantController = VariantControllerFactory.createVariantController();

const router = Router();
router.post("/create/:foodId", variantController.bulkUpdateVariants);
router.get("/all/:foodId", variantController.getVariantsByFoodId);
router.patch("/update/:variantId", variantController.updateVariant);

export const VariantRoutes = router;
