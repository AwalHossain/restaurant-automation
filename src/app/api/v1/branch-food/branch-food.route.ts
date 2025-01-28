// routes/food.routes.ts
import { Role } from "@prisma/client";
import { Router } from "express";
import { ENUM_USER_ROLE } from "../../../../enums/user";
import { BranchVariantController } from "../../../branch-variant/branch-variant.controller";
import { branchAuth } from "../../../middlewares/auth";
import auth from "../../../middlewares/auth/auth-middleware";
import branchTenantContextMiddleware from "../../../middlewares/auth/branch-tenantContext-middleware";
import publicTenantContext from "../../../middlewares/auth/public-tenant-context.middleware";
import { BranchFoodController } from "./branch-food.controller";



const router = Router();

const branchFoodController = new BranchFoodController();
const branchFoodVariantController = new BranchVariantController();

// food routes
router.post(
  "/create",
  branchAuth([Role.ADMIN, Role.MANAGER, Role.SUPER_ADMIN]),
  branchTenantContextMiddleware(),
  branchFoodController.createBranchFood
);

router.patch(
  "/update/:foodId",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
  branchTenantContextMiddleware(),
  branchFoodController.updateBranchFoodDetails
);

// get all foods
router.get("/all", 
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
  branchTenantContextMiddleware(),
  branchFoodController.getAllFoods);


  // get food by main category
router.get("/main-category",
  branchTenantContextMiddleware(),
  branchFoodController.getBranchFoodByMainCategoryId);

  // get food by sub category
router.get("/sub-category",
  publicTenantContext(),
  branchFoodController.getBranchFoodBySubCategoryId);

  // get food by category
router.get("/sub-category",
  publicTenantContext(),
  branchFoodController.getBranchFoodBySubCategoryId);

  // get food by category id
router.get("/category",
  publicTenantContext(),
  branchFoodController.getBranchFoodByCategoryId);

  // get food by food id
router.get("/get-one",
  branchTenantContextMiddleware(),
  branchFoodController.getBranchFoodById);

// get all foods by branch id
router.get("/:branchId/all", 
  branchTenantContextMiddleware(),
  branchFoodController.getAllFoodsbyBranchId);



router.post("/step/variant/create",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
  branchTenantContextMiddleware(),
  branchFoodVariantController.createBranchVariant);
// router.post(
//   "/step/addon/create",
//   auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
//   userContextMiddleware,
//   foodController.addAddonGroups
// );

export const BranchFoodRoutes = router;
