




import { Role } from '@prisma/client';
import express from 'express';
import { ENUM_USER_ROLE } from '../../../../../enums/user';
import auth from '../../../../middlewares/auth/auth-middleware';
import { branchAuth } from '../../../../middlewares/auth/branch-auth-middleware';
import tenantContextMiddleware from '../../../../middlewares/auth/tenant-context.middleware';
import { BranchController } from '../controller/branch.controller';


const router = express.Router();
const branchController = new BranchController();

router.post(
    '/create',
    auth(
        ENUM_USER_ROLE.SUPER_ADMIN,
        ENUM_USER_ROLE.ADMIN
    ),
    tenantContextMiddleware(),
    branchController.createBranch
);

// Basic Info
router.patch(
    '/:branchId/update-basic-info',
    branchAuth([Role.ADMIN, Role.MANAGER, Role.MODERATOR]),
    tenantContextMiddleware(),
    branchController.updateBranchBasicInfo
);

// Business Hours
router.patch(
    '/:branchId/update-business-hours',
    branchAuth([Role.ADMIN, Role.MANAGER, Role.MODERATOR]),
    tenantContextMiddleware(),
    branchController.updateBranchBusinessHours
);

// Delivery Settings
router.patch(
    '/:branchId/update-delivery-settings',
    branchAuth([Role.ADMIN, Role.MANAGER, Role.MODERATOR]),
    tenantContextMiddleware(),
    branchController.updateBranchDeliverySettings
);

router.get(
    '/get-all',
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    tenantContextMiddleware(),
    branchController.getAllBranch
);


router.get(
    '/:branchId/branch-details',
    branchAuth([Role.MODERATOR, Role.MANAGER]),
    tenantContextMiddleware(),
    branchController.getBranchById
);

router.patch(
    '/:branchId/update-status',
    branchAuth([Role.MANAGER]),
    tenantContextMiddleware(),
    branchController.updateBranchStatus
);  

router.delete(
    '/:branchId/delete',
    branchAuth([Role.SUPER_ADMIN]),
    tenantContextMiddleware(),
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
    tenantContextMiddleware(),
    branchController.getAllActiveBranch
);




export const branchRoutes = router; 