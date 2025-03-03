// routes/food.routes.ts
import { Router } from "express";
import { BranchPermissionNames as BPN, RestaurantPermissionNames as RPN, RRole } from "../../../../types/permission.types";
import { BranchVariantController } from "../../../branch-variant/branch-variant.controller";
import auth from "../../../middlewares/auth/auth-middleware";
import branchTenantContextMiddleware from "../../../middlewares/auth/branch-tenantContext-middleware";
import optionalAuth from "../../../middlewares/auth/optionalAuth-middleware";
import { accessControl } from "../../../middlewares/auth/permission-middleware";
import publicTenantContext from "../../../middlewares/auth/public-tenant-context.middleware";
import { BranchFoodController } from "./branch-food.controller";





const router = Router();

const branchFoodController = new BranchFoodController();
const branchFoodVariantController = new BranchVariantController();

// food routes
router.post(
  "/create",
 auth(),
  branchTenantContextMiddleware(),
  accessControl({
    allowedRoles: [RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
    staffPermissions: [
      RPN.MANAGE_RESTAURANT_BRANCHES,
      BPN.MANAGE_BRANCH_FOOD,
    ]

  }),
  branchFoodController.createBranchFood

);

router.patch(
  "/update/:foodId",
  auth(),
  branchTenantContextMiddleware(),
  accessControl({
    allowedRoles: [RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
    staffPermissions: [
      RPN.MANAGE_RESTAURANT_BRANCHES,
      BPN.MANAGE_BRANCH_FOOD,
    ]
  }),
  branchFoodController.updateBranchFoodDetails
);

// get all foods
router.get("/all", 
  optionalAuth(),
  publicTenantContext(),
  accessControl({
    access: 'PUBLIC',
    allowedRoles: [RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
    staffPermissions: [
      RPN.MANAGE_RESTAURANT_BRANCHES,
      BPN.MANAGE_BRANCH_FOOD,
      BPN.BRANCH_VIEW_FOOD,
      RPN.VIEW_RESTAURANT_FOOD
    ]
  }),
  branchFoodController.getAllFoods);


  // get food by main category
router.get("/main-category",
  branchTenantContextMiddleware(),
  branchFoodController.getBranchFoodByMainCategoryId);


  // get food by sub category
router.get("/sub-category",
  branchTenantContextMiddleware(),
  branchFoodController.getBranchFoodBySubCategoryId);


  // get food by category id
router.get("/category",
  branchTenantContextMiddleware(),
  branchFoodController.getBranchFoodByCategoryId);


  // get food by food id
router.get("/get-one",
  branchTenantContextMiddleware(),
  branchFoodController.getBranchFoodById);




// get all foods by branch id
router.get("/:branchId/all", 
  optionalAuth(),
  branchTenantContextMiddleware(),
  accessControl({
    access: 'PUBLIC',
    allowedRoles: [RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],

    staffPermissions: [
      RPN.MANAGE_RESTAURANT_BRANCHES,
      BPN.MANAGE_BRANCH_FOOD,
      BPN.BRANCH_VIEW_FOOD,
      RPN.VIEW_RESTAURANT_FOOD
    ]
  }),
  branchFoodController.getAllFoodsbyBranchId);




router.post("/step/variant/create",
  auth(),
  branchTenantContextMiddleware(),
  accessControl({
    allowedRoles:[RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
    staffPermissions:[BPN.MANAGE_BRANCH_ADDON, RPN.MANAGE_RESTAURANT_BRANCHES]
  }),
  branchFoodVariantController.createBranchVariant);
// router.post(
//   "/step/addon/create",
//   auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
//   userContextMiddleware,
//   foodController.addAddonGroups
// );

export const BranchFoodRoutes = router;
