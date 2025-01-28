import { Router } from 'express';
import tenantContextMiddleware from '../../../../middlewares/auth/tenant-context.middleware';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const controller = new AuthController();

router.post('/send-otp',  controller.initiateUserRegistration);
router.post('/verify-otp', controller.verifyOTP);
router.post('/register-user', controller.completeUserRegistration);
router.post('/login-user', controller.userLogin);


// admin routes
router.post('/register', controller.adminRegister);
router.post('/login',
    controller.adminLogin);

// super admin routes
router.post('/super/register', controller.superAdminRegister);
router.post('/super/login', controller.superAdminLogin);

// staff/Admin routes (for internal use only)
router.post('/staff/register', 
    tenantContextMiddleware(),
    controller.staffRegister);
router.post('/staff/login', 
    tenantContextMiddleware(),
    controller.staffLogin);


export const AdminAuthRoutes = router;
