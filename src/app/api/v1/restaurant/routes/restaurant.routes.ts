import { Router } from "express";
import { RestaurantController } from "../controller/restaurant.controller";
const router = Router();

const restaurantController = new RestaurantController();

router.post("/create", restaurantController.createRestaurant);
router.get("/", restaurantController.getAllRestaurants);
router.get("/domain/:domain", restaurantController.getRestaurantByDomain);
router.post("/create-branch", restaurantController.createBranch);
router.get("/branches/:restaurantId", restaurantController.getAllBranches);
router.get("/branch/:id", restaurantController.getBranchById);

export const RestaurantRoutes = router;
