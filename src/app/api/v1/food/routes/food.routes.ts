// routes/food.routes.ts
import { Router } from "express";
import multer from "multer";
import { ENUM_USER_ROLE } from "../../../../../enums/user";
import auth from "../../../../middlewares/auth/auth-middleware";
import branchTenantContextMiddleware from "../../../../middlewares/auth/branch-tenantContext-middleware";
import publicTenantContext from "../../../../middlewares/auth/public-tenant-context.middleware";
import tenantContextMiddleware from "../../../../middlewares/auth/tenant-context.middleware";
import { ControllerFactory, VariantControllerFactory } from "../factories/controller.factory";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const router = Router();

const foodController = ControllerFactory.createFoodController();
const variantController = VariantControllerFactory.createVariantController();

// food routes
router.post(
  "/create",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
  tenantContextMiddleware(),
  foodController.createFood
);

router.patch(
  "/update/:id",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
  tenantContextMiddleware(),
  foodController.updateFoodDetails
);

router.get("/:branchId/all", 
  publicTenantContext(),
  foodController.getAllFoods);

  // get food by main category
router.get("/main-category",
  publicTenantContext(),
  foodController.getFoodByMainCategoryId);

  // get food by sub category
router.get("/sub-category",
  publicTenantContext(),
  foodController.getFoodBySubCategoryId);

  // get food by category
router.get("/sub-category",
  publicTenantContext(),
  foodController.getFoodBySubCategoryId);

  // get food by category id
router.get("/category",
  publicTenantContext(),
  foodController.getFoodByCategoryId);

  // get food by food id
router.get("/get-one",
  publicTenantContext(),
  foodController.getFoodById);

router.post("/step/variant/create",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
  branchTenantContextMiddleware(),
  foodController.addVariants);
// router.post(
//   "/step/addon/create",
//   auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
//   userContextMiddleware,
//   foodController.addAddonGroups
// );

router.get("/:foodId/get-one",
  publicTenantContext(),
  foodController.getFoodById);

// approve food
router.post("/approve",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  tenantContextMiddleware(),
  foodController.approveFood);

export const FoodRoutes = router;
