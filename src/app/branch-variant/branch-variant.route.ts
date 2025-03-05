import { Router } from "express";
import { BranchPermissionNames as BPN, RestaurantPermissionNames as RPN, RRole } from "../../types/permission.types";
import auth from "../middlewares/auth/auth-middleware";
import branchTenantContextMiddleware from "../middlewares/auth/branch-tenantContext-middleware";
import { accessControl } from "../middlewares/auth/permission-middleware";
import { BranchVariantController } from "./branch-variant.controller";

const branchVariantController = new BranchVariantController();

const router = Router();
router.post("/create/:foodId", 
    auth(),
  branchTenantContextMiddleware(),
  accessControl({
    allowedRoles:[RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
    staffPermissions:[BPN.MANAGE_BRANCH_ADDON, RPN.MANAGE_RESTAURANT_BRANCHES]
  }),
    branchVariantController.bulkUpdateVariants);
router.get("/all/:foodId",
    auth(),
  branchTenantContextMiddleware(),
  accessControl({
    allowedRoles:[RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
    staffPermissions:[BPN.MANAGE_BRANCH_ADDON, RPN.MANAGE_RESTAURANT_BRANCHES]
  }),
    branchVariantController.getVariantsByFoodId);
router.patch("/update/:foodId/food-variant",
    auth(),
  branchTenantContextMiddleware(),
  accessControl({
    allowedRoles:[RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
    staffPermissions:[BPN.MANAGE_BRANCH_ADDON, RPN.MANAGE_RESTAURANT_BRANCHES]
  }),
    branchVariantController.updateVariant);

export const VariantRoutes = router;
