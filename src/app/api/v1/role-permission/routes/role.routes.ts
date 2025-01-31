import { Role } from '@prisma/client';
import express from 'express';
import auth from '../../../../middlewares/auth/auth-middleware';
import tenantContextMiddleware from '../../../../middlewares/auth/tenant-context.middleware';
import { RoleController } from '../controllers/role.controller';

const router = express.Router();
const roleController = new RoleController();

router.post('/', 
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    tenantContextMiddleware(),
    roleController.createRole
);

router.get('/', 
    auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
    tenantContextMiddleware(),
    roleController.getAllRoles
);

router.get('/all-with-permissions', 
    auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
    tenantContextMiddleware(),
    roleController.getAllRolesWithPermissions
);

router.get('/:id/permissions', 
    auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
    tenantContextMiddleware(),
    roleController.getAllPermissions
);

router.post('/default', 
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    tenantContextMiddleware(),
    roleController.createDefaultRoles
);

export const RoleRoutes = router; 