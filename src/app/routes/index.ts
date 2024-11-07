import express from 'express';
import { AdminAuthRoutes } from '../api/v1/admin/routes/auth.routes';

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
  }
  // Add more routes as needed
];

// Map through the routes
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;