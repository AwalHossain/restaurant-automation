import { Router } from "express";
import { RestaurantController } from "../controller/restaurant.controller";
import { RestaurantService } from "../services/restaurant.service";
import { RestaurantValidationService } from "../validations/restaurant.validation";
const router = Router();

const restaurantController = new RestaurantController(
  new RestaurantService(),
  new RestaurantValidationService()
);

router.post("/create", restaurantController.createRestaurant);
router.get("/", restaurantController.getAllRestaurants);
router.get("/:domain/domain", restaurantController.getRestaurantByDomain);
router.patch("/:restaurantId/update-settings", restaurantController.updateRestaurantSettings);
router.patch("/:restaurantId/update-points-system", restaurantController.updatePointsSystem);
export const RestaurantRoutes = router;
