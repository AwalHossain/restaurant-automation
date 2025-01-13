




import { Role } from '@prisma/client';
import express from 'express';
import { ENUM_USER_ROLE } from '../../../../../enums/user';
import auth from '../../../../middlewares/auth/auth-middleware';
import { branchAuth } from '../../../../middlewares/auth/branch-auth-middleware';
import { BranchController } from '../controller/branch.controller';


const router = express.Router();
const branchController = new BranchController();

router.post(
    '/create',
    auth(
        ENUM_USER_ROLE.SUPER_ADMIN,
        ENUM_USER_ROLE.ADMIN
    ),
    branchController.createBranch
);

// Basic Info
router.patch(
    '/:branchId/update-basic-info',
    branchAuth([ Role.MANAGER]),
    branchController.updateBranchBasicInfo
);

// Business Hours
router.patch(
    '/:branchId/update-business-hours',
    branchAuth([Role.MANAGER]),
    branchController.updateBranchBusinessHours
);

// Delivery Settings
router.patch(
    '/:branchId/update-delivery-settings',
    branchAuth([Role.MANAGER]),
    branchController.updateBranchDeliverySettings
);

router.get(
    '/get-all',
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    branchController.getAllBranch
);


router.get(
    '/:branchId/branch-details',
    branchAuth([Role.MODERATOR, Role.MANAGER]),
    branchController.getBranchById
);

router.patch(
    '/:branchId/update-status',
    auth(),
    branchAuth([Role.MANAGER]),
    branchController.updateBranchStatus
);  

router.delete(
    '/:branchId/delete',
    auth(
        ENUM_USER_ROLE.SUPER_ADMIN,
        ENUM_USER_ROLE.ADMIN
    ),
    branchController.deleteBranch
);

router.get(
    '/get-all-active',
    auth(
        ENUM_USER_ROLE.SUPER_ADMIN,
        ENUM_USER_ROLE.ADMIN
    ),
    branchController.getAllActiveBranch
);




export const branchRoutes = router; 