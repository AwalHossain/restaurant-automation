import express from 'express';
import { BranchPermissionNames as BPN, RestaurantPermissionNames as RPN, RRole } from '../../../../../types/permission.types';
import auth from '../../../../middlewares/auth/auth-middleware';
import { accessControl } from '../../../../middlewares/auth/permission-middleware';
import tenantContextMiddleware from '../../../../middlewares/auth/tenant-context.middleware';
import { AssignRoleController } from '../controllers/assignRole.controller';
import { RoleController } from '../controllers/role.controller';

const router = express.Router();
const roleController = new RoleController();
const assignRoleController = new AssignRoleController();

router.post('/', 
    auth(),
    tenantContextMiddleware(),
    accessControl({
        allowedRoles: [RRole.RESTAURANT_ADMIN],
        staffPermissions: [
            RPN.MANAGE_RESTAURANT_USERS,
        ]

    }),

    roleController.createRole
);

router.get('/', 
    auth(),
    tenantContextMiddleware(),
    accessControl({
        allowedRoles: [RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
        staffPermissions: [
            BPN.MANAGE_BRANCH_USERS,
            RPN.MANAGE_RESTAURANT_USERS,

        ]
    }),
    roleController.getAllRoles
);

router.get('/all-with-permissions', 
    auth(),
    tenantContextMiddleware(),
    accessControl({
        allowedRoles: [RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
        staffPermissions: [
            BPN.MANAGE_BRANCH_USERS,
            RPN.MANAGE_RESTAURANT_USERS,
        ]
    }),
    roleController.getAllRolesWithPermissions

);


// router.post('/default', 
//     auth(Role.SUPER_ADMIN, Role.ADMIN),
//     tenantContextMiddleware(),
//     roleController.createDefaultRoles
// );

router.get('/:id/get-my-roles', 
    auth(),
    tenantContextMiddleware(),
    accessControl({
        access: RRole.ALL
 }),
    assignRoleController.getUserRoles
);



export const RoleRoutes = router; 