import { Router } from 'express';
import { AdminAuthController } from '../controllers/auth.controller';

const router = Router();
const controller = new AdminAuthController();

router.post('/register',  controller.register);
router.post('/login', controller.login);


export const AdminAuthRoutes = router;
