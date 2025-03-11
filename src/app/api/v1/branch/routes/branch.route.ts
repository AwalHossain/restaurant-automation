import express from 'express';
import { BranchPermissionNames as BPN, RestaurantPermissionNames as RPN, RRole } from '../../../../../types/permission.types';
import auth from '../../../../middlewares/auth/auth-middleware';
import branchTenantContextMiddleware from '../../../../middlewares/auth/branch-tenantContext-middleware';
import { accessControl } from '../../../../middlewares/auth/permission-middleware';
import tenantContextMiddleware from '../../../../middlewares/auth/tenant-context.middleware';
import { BranchController } from '../controller/branch.controller';

const router = express.Router();
const branchController = new BranchController();




router.post(
    '/create',
    auth(),
    tenantContextMiddleware(),
    accessControl({
        allowedRoles: [RRole.RESTAURANT_ADMIN],
        staffPermissions: [
            RPN.MANAGE_RESTAURANT_BRANCHES,
        ]
    }),
    branchController.createBranch
);



// Basic Info
router.patch(
    '/:branchId/update-basic-info',
    auth(),
    branchTenantContextMiddleware(),
    accessControl({
        allowedRoles: [RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
        staffPermissions: [
            RPN.MANAGE_RESTAURANT_BRANCHES,
            BPN.MANAGE_BRANCH_SETTINGS,
        ]
    }),
    branchController.updateBranchBasicInfo
);


// Business Hours
router.patch(
    '/:branchId/update-business-hours',
    auth(),
    branchTenantContextMiddleware(),
    accessControl({
        allowedRoles: [RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
        staffPermissions: [
            RPN.MANAGE_RESTAURANT_BRANCHES,
            BPN.MANAGE_BRANCH_SETTINGS,
        ]
    }),
    branchController.updateBranchBusinessHours

);

// Delivery Settings
router.patch(
    '/:branchId/update-delivery-settings',
    auth(),
    branchTenantContextMiddleware(),
    accessControl({
        allowedRoles: [RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
        staffPermissions: [
            RPN.MANAGE_RESTAURANT_BRANCHES,
            BPN.MANAGE_BRANCH_SETTINGS,
        ]
    }),
    branchController.updateBranchDeliverySettings
);

router.get(
    '/get-all',
    auth(),
    branchTenantContextMiddleware(),
    accessControl({
        allowedRoles: [RRole.RESTAURANT_ADMIN],
        staffPermissions: [
            RPN.MANAGE_RESTAURANT_BRANCHES,
        ]
    }),
    branchController.getAllBranch
);


router.get(
    '/:branchId/branch-details',
    auth(),
    branchTenantContextMiddleware(),
    accessControl({
        allowedRoles: [RRole.RESTAURANT_ADMIN, RRole.BRANCH_MANAGER],
        staffPermissions: [
            RPN.MANAGE_RESTAURANT_BRANCHES,
            BPN.MANAGE_BRANCH_SETTINGS,
        ]
    }),
    branchController.getBranchById

);

router.patch(
    '/:branchId/update-status',
    auth(),
    branchTenantContextMiddleware(),
    accessControl({
        allowedRoles: [RRole.RESTAURANT_ADMIN],
        staffPermissions: [
            RPN.MANAGE_RESTAURANT_BRANCHES,
        ]
    }),
    branchController.updateBranchStatus

);  

router.delete(
    '/:branchId/delete',
    auth(),
    branchTenantContextMiddleware(),
    accessControl({
        allowedRoles: [RRole.RESTAURANT_ADMIN],
        staffPermissions: [
            RPN.MANAGE_RESTAURANT_BRANCHES,
        ]
    }),
    branchController.deleteBranch
);

router.get(
    '/get-all-active',
    auth(),
    branchTenantContextMiddleware(),
    accessControl({
        allowedRoles: [RRole.RESTAURANT_ADMIN],
        staffPermissions: [
            RPN.MANAGE_RESTAURANT_BRANCHES,
        ]
    }),
    branchController.getAllActiveBranch
);




export const branchRoutes = router; 