import { Role } from "@prisma/client";
import { Router } from "express";
import auth from "../../../../middlewares/auth/auth-middleware";
import { RestaurantController } from "../controller/restaurant.controller";
import { RestaurantService } from "../services/restaurant.service";
import { RestaurantValidationService } from "../validations/restaurant.validation";
const router = Router();

const restaurantController = new RestaurantController(
  new RestaurantService(),
  new RestaurantValidationService()
);

router.post("/create",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
   restaurantController.createRestaurant);
router.get("/",
  auth(Role.SUPER_ADMIN, Role.ADMIN),
  restaurantController.getAllRestaurants);
router.get("/:domain/domain",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  restaurantController.getRestaurantByDomain);
router.patch("/:restaurantId/update-settings",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  restaurantController.updateRestaurantSettings);
router.patch("/:restaurantId/update-points-system",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  restaurantController.updatePointsSystem);
export const RestaurantRoutes = router;
