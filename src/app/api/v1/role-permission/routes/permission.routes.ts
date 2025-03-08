import express from 'express';
import { BranchPermissionNames as BPN, RestaurantPermissionNames as RPN, RRole } from '../../../../../types/permission.types';
import auth from '../../../../middlewares/auth/auth-middleware';
import { accessControl } from '../../../../middlewares/auth/permission-middleware';
import tenantContextMiddleware from '../../../../middlewares/auth/tenant-context.middleware';
import { PermissionController } from '../controllers/permission.controller';

const router = express.Router();
const permissionController = new PermissionController();


router.post('/', 
    auth(),
    tenantContextMiddleware(),
    accessControl({  
        allowedRoles: [RRole.RESTAURANT_ADMIN],
        staffPermissions: [
            RPN.MANAGE_RESTAURANT_USERS
        ]
    }),
    permissionController.createPermission
);
router.get('/search', 
    auth(),
    tenantContextMiddleware(),
    accessControl({
        allowedRoles: [RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
        staffPermissions: [
            RPN.MANAGE_RESTAURANT_USERS,
            BPN.MANAGE_BRANCH_USERS,
        ]
    }),
    permissionController.getPermissions

);


router.get('/', 
    auth(),
    tenantContextMiddleware(),
    accessControl({
        allowedRoles: [RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
        staffPermissions: [
            RPN.MANAGE_RESTAURANT_USERS,
            BPN.MANAGE_BRANCH_USERS,
        ]
    }),
    permissionController.getAllPermissions
);




router.get('/:id/get-permissions', 

    auth(),
    tenantContextMiddleware(),

    accessControl({
        access: 'ALL'
    }),
    permissionController.getPermissionById
);



// router.patch('/:id/update-permissions', 
//     auth(),
//     tenantContextMiddleware(),
//     accessControl({
//         allowedRoles: [RRole.RESTAURANT_ADMIN],
//     }),
//     permissionController.updatePermission
// // );

// router.delete('/:id/delete-permissions', 
//     auth(),
//     tenantContextMiddleware(),
//     accessControl({
//         allowedRoles: [RRole.RESTAURANT_ADMIN],
//     }),
//     permissionController.deletePermission
// );


// // seed permissions
//     router.post('/seed', 
//         auth(),
//         tenantContextMiddleware(),
//         permissionController.
//     );


export const PermissionRoutes = router;