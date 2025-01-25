import { Role } from "@prisma/client";
import { Router } from "express";
import auth from "../../../../middlewares/auth/auth-middleware";
import tenantContextMiddleware from "../../../../middlewares/auth/tenant-context.middleware";
import { RestaurantController } from "../controller/restaurant.controller";
import { RestaurantService } from "../services/restaurant.service";
import { RestaurantValidationService } from "../validations/restaurant.validation";
const router = Router();

const restaurantController = new RestaurantController(
  new RestaurantService(),
  new RestaurantValidationService()
);

// Create Restaurant
router.post("/create",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
   restaurantController.createRestaurant);

  // Get restaurant with branch and settings
router.get("/",
  auth(Role.SUPER_ADMIN, Role.ADMIN),
  tenantContextMiddleware(),
  restaurantController.getAllRestaurants);

  // Restaurant By Domain
router.get("/:domain/domain",
  // auth(Role.ADMIN, Role.SUPER_ADMIN),
  // tenantContextMiddleware(),
  restaurantController.getRestaurantByDomain);

  // Restaurant Settings
router.patch("/:restaurantId/update-settings",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  tenantContextMiddleware(),
  restaurantController.updateRestaurantSettings);

  // Restaurant By Admin Id
router.get("/:adminId/admin",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  tenantContextMiddleware(),
  restaurantController.getRestaurantByAdminId);

  // Restaurant By Tenant Id
router.get("/:tenantId/tenant",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  tenantContextMiddleware(),
  restaurantController.getRestaurantByTenantId);


  // Points System
router.patch("/:restaurantId/update-points-system",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  tenantContextMiddleware(),
  restaurantController.updatePointsSystem);

// get all branches related to restaurant
router.get("/:restaurantId/branches",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  tenantContextMiddleware(),
  restaurantController.getAllBranches);

  
export const RestaurantRoutes = router;
