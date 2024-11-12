import express from 'express';
import { AdminAuthRoutes } from '../api/v1/authentication/routes/auth.routes';
import { campaignRoutes } from '../api/v1/campaign/routes/campaign.routes';
import { FoodRoutes } from '../api/v1/food/routes/food.routes';
import { RestaurantRoutes } from '../api/v1/restaurant/routes/restaurant.routes';

const router = express.Router();

// Define the interface for module routes
interface ModuleRoute {
  path: string;
  route: express.Router ;
}

// Create array of module routes
const moduleRoutes: ModuleRoute[] = [
  {
    path: '/auth',
    route: AdminAuthRoutes
  },
  {
    path: '/food',
    route: FoodRoutes
  },
  {
    path: '/restaurant',
    route: RestaurantRoutes
  },
  {
    path: '/campaign',
    route: campaignRoutes
  }
  // Add more routes as needed
];

// Map through the routes
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
