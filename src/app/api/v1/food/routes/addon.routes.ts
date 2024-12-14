import { Router } from "express";
import multer from "multer";
import { ENUM_USER_ROLE } from "../../../../../enums/user";
import auth from "../../../../middlewares/auth";
import { ControllerFactory } from "../factories/controller.factory";

const addonController = ControllerFactory.createAddonController();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const router = Router();

// Standalone Addon Routes
router
  .route('/')
  .post(
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
    upload.single("image"),
    addonController.createAddon
  )
  .get(addonController.getAddOns);


// active addons
router.get('/active', addonController.getActiveAddOns);

// Get all food-addon relationships
router.get('/food-addons', addonController.getAllFoodAddons);
// Get active food-addon relationships
router.get('/food-addons/active', addonController.getActiveAddOns);


router
  .route('/:id')
  .get(addonController.getAddOnById)
  .patch(
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    upload.single("image"),
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
  addonController.toggleAddOn
);

// Food-Addon Relationship Routes
router
  .route('/food/:foodId/addons')
  .post(
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
    addonController.createBulkFoodAddons
  )
  .get(addonController.getFoodAddonsByFoodId);

router
  .route('/food/:foodId/addon/:addonId')
  .patch(
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    addonController.updateFoodAddon
  )
  .delete(
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    addonController.deleteFoodAddon
  );

// Status toggle for food-addon relationship
router.patch(
  '/food/:foodId/addon/:addonId/toggle',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  addonController.toggleFoodAddOn
);

export const AddonRoutes = router;
