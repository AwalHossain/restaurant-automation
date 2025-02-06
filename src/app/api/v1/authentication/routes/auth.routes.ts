import { Role } from '@prisma/client';
import { Router } from 'express';
import { RestaurantPermissionNames } from '../../../../../types/permission.types';
import auth from '../../../../middlewares/auth/auth-middleware';
import { accessControl } from '../../../../middlewares/auth/permission-middleware';
import tenantContextMiddleware from '../../../../middlewares/auth/tenant-context.middleware';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const controller = new AuthController();

router.post('/send-otp', controller.initiateUserRegistration);
router.post('/verify-otp', controller.verifyOTP);
router.post('/register-user', controller.completeUserRegistration);
router.post('/login-user', controller.userLogin);


// admin routes
router.post('/register', controller.adminRegister);
router.post('/login', controller.unifiedLogin);

// super admin routes
// router.post('/super/register', controller.superAdminRegister);
router.post('/super/login', controller.unifiedLogin);

// staff/Admin routes (for internal use only)
router.post('/staff/register',
    auth(),
    tenantContextMiddleware(),
    accessControl({
        allowedRoles: [Role.SUPER_ADMIN, Role.ADMIN],
        staffPermissions: [
            RestaurantPermissionNames.MANAGE_RESTAURANT_USERS
        ]
    }),controller.staffRegister);


router.post('/staff/login',
    tenantContextMiddleware(),
    controller.unifiedLogin);

// auth.routes.ts
router.get('/staff/select-role',
    auth(),
    tenantContextMiddleware(),
    controller.selectRole);

router.get('/staff/switch-role',
    auth(),
    tenantContextMiddleware(),
    controller.switchRole);

router.get('/staff/user-context',
    auth(),
    tenantContextMiddleware(),
    controller.getUserContext);


export const AdminAuthRoutes = router;
