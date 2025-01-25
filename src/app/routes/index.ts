import express from "express";
import { AdminAuthRoutes } from "../api/v1/authentication/routes/auth.routes";
import { BranchAddonRoutes } from "../api/v1/branch-addon/branch-addon.route";
import { BranchFoodRoutes } from "../api/v1/branch-food/branch-food.route";
import { BranchStaffRoutes } from "../api/v1/branch-staff/routes/branch-staff.routes";
import { branchRoutes } from "../api/v1/branch/routes/branch.route";
import { campaignRoutes } from "../api/v1/campaign/routes/campaign.routes";
import { cartRoutes } from "../api/v1/cart/routes/cart.routes";
import { checkoutRoutes } from "../api/v1/checkout/routes/checkout.routes";
import { AddonRoutes } from "../api/v1/food/routes/addon.routes";
import { CategoryRoutes } from "../api/v1/food/routes/category.routes";
import { FoodRoutes } from "../api/v1/food/routes/food.routes";
import { VariantRoutes } from "../api/v1/food/routes/variant.routes";
import { PromotionRoutes } from "../api/v1/promotion/routes/promotion.routes";
import { RestaurantRoutes } from "../api/v1/restaurant/routes/restaurant.routes";

const router = express.Router();

// Define the interface for module routes
interface ModuleRoute {
  path: string;
  route: express.Router;
}

// Create array of module routes
const moduleRoutes: ModuleRoute[] = [
  {
    path: "/auth",
    route: AdminAuthRoutes
  },
  {
    path: "/food",
    route: FoodRoutes
  },
  {
    path: "/branch-food",
    route: BranchFoodRoutes
  },
  {
    path: "/branch-addon",
    route: BranchAddonRoutes
  },
  {
    path: "/category",
    route: CategoryRoutes
  },
  {
    path: "/addon",
    route: AddonRoutes
  },
  {
    path: "/variant",
    route: VariantRoutes
  },
  {
    path: "/restaurant",
    route: RestaurantRoutes
  },
  {
    path: "/checkout",
    route: checkoutRoutes
  },
  {
    path: "/campaign",
    route: campaignRoutes
  },
  {
    path: "/promotion",
    route: PromotionRoutes
  },
  {
    path: "/cart",
    route: cartRoutes
  },
  {
    path: "/branch",
    route: branchRoutes
  },
  {
    path: "/branch-staff",
    route: BranchStaffRoutes
  }
  // Add more routes as needed
];

// Map through the routes
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
