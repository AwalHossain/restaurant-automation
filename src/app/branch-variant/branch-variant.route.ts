import { Router } from "express";
import { ENUM_USER_ROLE } from "../../enums/user";
import auth from "../middlewares/auth/auth-middleware";
import tenantContextMiddleware from "../middlewares/auth/tenant-context.middleware";
import { BranchVariantController } from "./branch-variant.controller";

const branchVariantController = new BranchVariantController();

const router = Router();
router.post("/create/:foodId", 
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    tenantContextMiddleware(),
    branchVariantController.bulkUpdateVariants);
router.get("/all/:foodId",
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    tenantContextMiddleware(),
    branchVariantController.getVariantsByFoodId);
router.patch("/update/:foodId/food-variant",
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    tenantContextMiddleware(),
    branchVariantController.updateVariant);

export const VariantRoutes = router;
