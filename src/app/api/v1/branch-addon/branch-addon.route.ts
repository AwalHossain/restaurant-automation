import { Router } from "express";
import { BranchPermissionNames as BPN, RestaurantPermissionNames as RPN, RRole } from "../../../../types/permission.types";
import auth from "../../../middlewares/auth/auth-middleware";
import branchTenantContextMiddleware from "../../../middlewares/auth/branch-tenantContext-middleware";
import { accessControl } from "../../../middlewares/auth/permission-middleware";
import { BranchAddonController } from "./branch-addon.controller";

const router = Router();

const branchAddonController = new BranchAddonController();

// Standalone Addon Routes

router
  .route('/')
  .post(
    auth(),
    branchTenantContextMiddleware(),
    accessControl({
      allowedRoles:[RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
      staffPermissions:[BPN.MANAGE_BRANCH_ADDON, RPN.MANAGE_RESTAURANT_BRANCHES]
    }),
    branchAddonController.createBranchAddon
  )
  .get(
    auth(),
    branchTenantContextMiddleware(),
    accessControl({
      allowedRoles:[RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
      staffPermissions:[BPN.MANAGE_BRANCH_ADDON, RPN.MANAGE_RESTAURANT_BRANCHES]
    }),
    branchAddonController.getBranchAddOns
  );


// active addons
router.get('/active',
  auth(),
  branchTenantContextMiddleware(),
  accessControl({
    allowedRoles:[RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
    staffPermissions:[BPN.MANAGE_BRANCH_ADDON, RPN.MANAGE_RESTAURANT_BRANCHES]
  }),
  branchAddonController.getActiveBranchAddOns);

// Get all food-addon relationships
router.get('/food-addons', 
  auth(),
  branchTenantContextMiddleware(),
  accessControl({
    allowedRoles:[RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
    staffPermissions:[BPN.MANAGE_BRANCH_ADDON, RPN.MANAGE_RESTAURANT_BRANCHES]
  }),
  branchAddonController.getAllBranchFoodAddons);

  
// Get active food-addon relationships
router.get('/food-addons/active', 
  auth(),
  branchTenantContextMiddleware(),
  accessControl({
    allowedRoles:[RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
    staffPermissions:[BPN.MANAGE_BRANCH_ADDON, RPN.MANAGE_RESTAURANT_BRANCHES]
  }),
  branchAddonController.getActiveBranchFoodAddons);


router
  .route('/:id')
  .get(
    auth(),
    branchTenantContextMiddleware(),
    accessControl({
      allowedRoles:[RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
      staffPermissions:[BPN.MANAGE_BRANCH_ADDON, RPN.MANAGE_RESTAURANT_BRANCHES]
    }),
    branchAddonController.getBranchAddOnById)
  .patch(
    auth(),
    branchTenantContextMiddleware(),
    accessControl({
      allowedRoles:[RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
      staffPermissions:[BPN.MANAGE_BRANCH_ADDON, RPN.MANAGE_RESTAURANT_BRANCHES]
    }),
    branchAddonController.updateBranchAddOn
  )
  // .delete(
  //   auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  //   addonController.
  // );





// Status toggle for standalone addon
router.patch(
  '/:id/toggle',
  auth(),
  branchTenantContextMiddleware(),
  accessControl({
    allowedRoles:[RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
    staffPermissions:[BPN.MANAGE_BRANCH_ADDON, RPN.MANAGE_RESTAURANT_BRANCHES]
  }),
  branchAddonController.toggleBranchAddOn
);

// Food-Addon Relationship Routes
router
  .route('/food/:foodId/addons')
  .post(
    auth(),
    branchTenantContextMiddleware(),
    accessControl({
      allowedRoles:[RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
      staffPermissions:[BPN.MANAGE_BRANCH_ADDON, RPN.MANAGE_RESTAURANT_BRANCHES]
    }),
    branchAddonController.createBulkBranchFoodAddons
  )
  .get(
    auth(),
    branchTenantContextMiddleware(),
    accessControl({
      allowedRoles:[RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
      staffPermissions:[BPN.MANAGE_BRANCH_ADDON, RPN.MANAGE_RESTAURANT_BRANCHES]
    }),
    branchAddonController.getBranchFoodAddonsByFoodId);

router
  .route('/food-addon/:foodAddonId')
  .patch(
    auth(),
    branchTenantContextMiddleware(),
    accessControl({
      allowedRoles:[RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
      staffPermissions:[BPN.MANAGE_BRANCH_ADDON, RPN.MANAGE_RESTAURANT_BRANCHES]
    }),
    branchAddonController.updateBranchFoodAddon
  )
  .delete(
    auth(),
    branchTenantContextMiddleware(),
    accessControl({
      allowedRoles:[RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
      staffPermissions:[BPN.MANAGE_BRANCH_ADDON, RPN.MANAGE_RESTAURANT_BRANCHES]
    }),
    branchAddonController.deleteBranchFoodAddon
  );

// Status toggle for food-addon relationship
router.patch(
  '/food-addon/:foodAddonId/toggle',
  auth(),
  branchTenantContextMiddleware(),
  accessControl({
    allowedRoles:[RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
    staffPermissions:[BPN.MANAGE_BRANCH_ADDON, RPN.MANAGE_RESTAURANT_BRANCHES]
  }),
  branchAddonController.toggleBranchFoodAddOn
);

export const BranchAddonRoutes = router;
