import { Router } from "express";
import { BranchPermissionNames as BPN, RestaurantPermissionNames as RPN, RRole } from "../../../../types/permission.types";
import auth from "../../../middlewares/auth/auth-middleware";
import optionalAuth from "../../../middlewares/auth/optionalAuth-middleware";
import { accessControl } from "../../../middlewares/auth/permission-middleware";
import publicTenantContext from "../../../middlewares/auth/public-tenant-context.middleware";
import tenantContextMiddleware from "../../../middlewares/auth/tenant-context.middleware";
import { BranchCategoryController } from "./branch-category.controller";



const router = Router();

const branchCategoryController = new BranchCategoryController();

router.post("/create",
    auth(),
    tenantContextMiddleware(),
    accessControl({
      allowedRoles:([RRole.BRANCH_MANAGER, RRole.RESTAURANT_ADMIN]),
      staffPermissions: [
        RPN.MANAGE_RESTAURANT_BRANCHES,
        BPN.MANAGE_BRANCH_FOOD,
      ]
    }),
   branchCategoryController.createCategory);

router.get("/all", 
  optionalAuth(),
  publicTenantContext(),
  accessControl({
    access: 'PUBLIC',
    allowedRoles:([ RRole.RESTAURANT_ADMIN]),
    staffPermissions: [
      RPN.MANAGE_RESTAURANT_BRANCHES,
      BPN.MANAGE_BRANCH_FOOD,
    ]
  }),
  branchCategoryController.getAllBranchCategories);

  // get all active categories
router.get("/active", 
  optionalAuth(),
  publicTenantContext(),
  accessControl({
    access: 'PUBLIC',
  }),
  branchCategoryController.getActiveBranchCategories);

// get category with children
router.get("/:id", 
  optionalAuth(),
  publicTenantContext(),
  accessControl({
    access: 'PUBLIC',
  }),
  branchCategoryController.getBranchCategoryWithChildren);

  // toggle branch category active status
router.patch("/toggle/:id", 
  auth(),
  tenantContextMiddleware(),
  accessControl({
    allowedRoles:([RRole.BRANCH_MANAGER, RRole.RESTAURANT_ADMIN]),
    staffPermissions: [
      RPN.MANAGE_RESTAURANT_BRANCHES,
      BPN.MANAGE_BRANCH_FOOD,
    ]
  }),
  branchCategoryController.toggleBranchCategoryActiveStatus
);

// add sub branch category
router.post(
  "/add-sub",
  auth(),
  tenantContextMiddleware(),
  accessControl({
    allowedRoles:([RRole.BRANCH_MANAGER, RRole.RESTAURANT_ADMIN]),
    staffPermissions: [
      RPN.MANAGE_RESTAURANT_BRANCHES,
      BPN.MANAGE_BRANCH_FOOD,
    ]
  }),
  branchCategoryController.addSubBranchCategory
);
router.patch(
  "/update",
  auth(),
  tenantContextMiddleware(),
  accessControl({
    allowedRoles:([RRole.BRANCH_MANAGER, RRole.RESTAURANT_ADMIN]),
    staffPermissions: [
      RPN.MANAGE_RESTAURANT_BRANCHES,
      BPN.MANAGE_BRANCH_FOOD,
    ]
  }),
  branchCategoryController.updateBranchCategoryWithSubs
);

export const BranchCategoryRoutes = router;
