import { Router } from "express";
import { ENUM_USER_ROLE } from "../../../../../enums/user";
import auth from "../../../../middlewares/auth/auth-middleware";
import tenantContextMiddleware from "../../../../middlewares/auth/tenant-context.middleware";
import { VariantControllerFactory } from "../factories/controller.factory";

const variantController = VariantControllerFactory.createVariantController();

const router = Router();
router.post("/create/:foodId", 
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    tenantContextMiddleware(),
    variantController.bulkUpdateVariants);
router.get("/all/:foodId",
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    tenantContextMiddleware(),
    variantController.getVariantsByFoodId);
router.patch("/update/:foodId/food-variant",
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    tenantContextMiddleware(),
    variantController.updateVariant);

export const VariantRoutes = router;
