




import { Role } from '@prisma/client';
import express from 'express';
import { ENUM_USER_ROLE } from '../../../../../enums/user';
import auth from '../../../../middlewares/auth/auth-middleware';
import { branchAuth } from '../../../../middlewares/auth/branch-auth-middleware';
import branchTenantContextMiddleware from '../../../../middlewares/auth/branch-tenantContext-middleware';
import { BranchController } from '../controller/branch.controller';


const router = express.Router();
const branchController = new BranchController();

router.post(
    '/create',
    auth(
        ENUM_USER_ROLE.SUPER_ADMIN,
        ENUM_USER_ROLE.ADMIN
    ),
    branchTenantContextMiddleware(),
    branchController.createBranch
);

// Basic Info
router.patch(
    '/:branchId/update-basic-info',
    branchAuth([Role.ADMIN, Role.MANAGER, Role.MODERATOR]),
    branchTenantContextMiddleware(),
    branchController.updateBranchBasicInfo
);

// Business Hours
router.patch(
    '/:branchId/update-business-hours',
    branchAuth([Role.ADMIN, Role.MANAGER, Role.MODERATOR]),
    branchTenantContextMiddleware(),
    branchController.updateBranchBusinessHours
);

// Delivery Settings
router.patch(
    '/:branchId/update-delivery-settings',
    branchAuth([Role.ADMIN, Role.MANAGER, Role.MODERATOR]),
    branchTenantContextMiddleware(),
    branchController.updateBranchDeliverySettings
);

router.get(
    '/get-all',
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    branchTenantContextMiddleware(),
    branchController.getAllBranch
);


router.get(
    '/:branchId/branch-details',
    branchAuth([Role.MODERATOR, Role.MANAGER]),
    branchTenantContextMiddleware(),
    branchController.getBranchById
);

router.patch(
    '/:branchId/update-status',
    branchAuth([Role.MANAGER]),
    branchTenantContextMiddleware(),
    branchController.updateBranchStatus
);  

router.delete(
    '/:branchId/delete',
    branchAuth([Role.SUPER_ADMIN]),
    branchTenantContextMiddleware(),
    branchController.deleteBranch
);

router.get(
    '/get-all-active',
    auth(
        ENUM_USER_ROLE.SUPER_ADMIN,
        ENUM_USER_ROLE.ADMIN,
        ENUM_USER_ROLE.MODERATOR,
        ENUM_USER_ROLE.MANAGER
    ),
    branchTenantContextMiddleware(),
    branchController.getAllActiveBranch
);




export const branchRoutes = router; 