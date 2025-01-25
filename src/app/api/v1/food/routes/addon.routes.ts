import { Router } from "express";
import { ENUM_USER_ROLE } from "../../../../../enums/user";
import auth from "../../../../middlewares/auth/auth-middleware";
import tenantContextMiddleware from "../../../../middlewares/auth/tenant-context.middleware";
import { ControllerFactory } from "../factories/controller.factory";

const addonController = ControllerFactory.createAddonController();


const router = Router();

// Standalone Addon Routes
router
  .route('/')
  .post(
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    tenantContextMiddleware(),
    addonController.createAddon
  )
  .get(
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    tenantContextMiddleware(),
    addonController.getAddOns
  );


// active addons
router.get('/active',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  tenantContextMiddleware(),
  addonController.getActiveAddOns);

// Get all food-addon relationships
router.get('/food-addons', 
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  tenantContextMiddleware(),
  addonController.getAllFoodAddons);

  
// Get active food-addon relationships
router.get('/food-addons/active', 
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  tenantContextMiddleware(),
  addonController.getActiveFoodAddons);


router
  .route('/:id')
  .get(
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    tenantContextMiddleware(),
    addonController.getAddOnById)
  .patch(
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    tenantContextMiddleware(),
    addonController.updateAddOn
  )
  // .delete(
  //   auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  //   addonController.
  // );





// Status toggle for standalone addon
router.patch(
  '/:id/toggle',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  tenantContextMiddleware(),
  addonController.toggleAddOn
);

// Food-Addon Relationship Routes
router
  .route('/food/:foodId/addons')
  .post(
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    tenantContextMiddleware(),
    addonController.createBulkFoodAddons
  )
  .get(
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    tenantContextMiddleware(),
    addonController.getFoodAddonsByFoodId);

router
  .route('/food/:foodId/addon/:addonId')
  .patch(
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    tenantContextMiddleware(),
    addonController.updateFoodAddon
  )
  .delete(
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    tenantContextMiddleware(),
    addonController.deleteFoodAddon
  );

// Status toggle for food-addon relationship
router.patch(
  '/food/:foodId/addon/:addonId/toggle',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  tenantContextMiddleware(),
  addonController.toggleFoodAddOn
);

export const AddonRoutes = router;
