import { Router } from "express";
import { ENUM_USER_ROLE } from "../../../../enums/user";
import { branchAuth } from "../../../middlewares/auth";
import branchTenantContextMiddleware from "../../../middlewares/auth/branch-tenantContext-middleware";
import { BranchAddonController } from "./branch-addon.controller";

const router = Router();

const branchAddonController = new BranchAddonController();

// Standalone Addon Routes
router
  .route('/')
  .post(
    branchAuth([ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN]),
    branchTenantContextMiddleware(),
    branchAddonController.createBranchAddon
  )
  .get(
    branchAuth([ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN]),
    branchTenantContextMiddleware(),
    branchAddonController.getBranchAddOns
  );


// active addons
router.get('/active',
  branchAuth([ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN]),
  branchTenantContextMiddleware(),
  branchAddonController.getActiveBranchAddOns);

// Get all food-addon relationships
router.get('/food-addons', 
  branchAuth([ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN]),
  branchTenantContextMiddleware(),
  branchAddonController.getAllBranchFoodAddons);

  
// Get active food-addon relationships
router.get('/food-addons/active', 
  branchAuth([ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN]),
  branchTenantContextMiddleware(),
  branchAddonController.getActiveBranchFoodAddons);


router
  .route('/:id')
  .get(
    branchAuth([ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN]),
    branchTenantContextMiddleware(),
    branchAddonController.getBranchAddOnById)
  .patch(
    branchAuth([ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN]),
    branchTenantContextMiddleware(),
    branchAddonController.updateBranchAddOn
  )
  // .delete(
  //   auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  //   addonController.
  // );





// Status toggle for standalone addon
router.patch(
  '/:id/toggle',
  branchAuth([ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN]),
  branchTenantContextMiddleware(),
  branchAddonController.toggleBranchAddOn
);

// Food-Addon Relationship Routes
router
  .route('/food/:foodId/addons')
  .post(
    branchAuth([ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN]),
    branchTenantContextMiddleware(),
    branchAddonController.createBulkBranchFoodAddons
  )
  .get(
    branchAuth([ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN]),
    branchTenantContextMiddleware(),
    branchAddonController.getBranchFoodAddonsByFoodId);

router
  .route('/food/:foodId/addon/:addonId')
  .patch(
    branchAuth([ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN]),
    branchTenantContextMiddleware(),
    branchAddonController.updateBranchFoodAddon
  )
  .delete(
    branchAuth([ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN]),
    branchTenantContextMiddleware(),
    branchAddonController.deleteBranchFoodAddon
  );

// Status toggle for food-addon relationship
router.patch(
  '/food/:foodId/addon/:addonId/toggle',
  branchAuth([ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN]),
  branchTenantContextMiddleware(),
  branchAddonController.toggleBranchFoodAddOn
);

export const BranchAddonRoutes = router;
