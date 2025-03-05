

import express from 'express';
import { RRole } from '../../../../../types/permission.types';
import auth from '../../../../middlewares/auth/auth-middleware';
import { accessControl } from '../../../../middlewares/auth/permission-middleware';
import tenantContextMiddleware from '../../../../middlewares/auth/tenant-context.middleware';
import { AssignRoleController } from '../controllers/assignRole.controller';

const router = express.Router();
const assignRoleController = new AssignRoleController();




router.get('/', 
    auth(),
    tenantContextMiddleware(),
    accessControl({
        access: RRole.ALL

    }),
    assignRoleController.getUserRoles

);

export const assignRoleRoutes = router;



