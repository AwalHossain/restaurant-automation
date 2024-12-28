




import express from 'express';
import { ENUM_USER_ROLE } from '../../../../../enums/user';
import auth from '../../../../middlewares/auth';
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


router.patch(
    '/:branchId/update-business-hours',
    auth(
        ENUM_USER_ROLE.SUPER_ADMIN,
        ENUM_USER_ROLE.ADMIN
    ),
    branchController.updateBranchBusinessHours
);


router.get(
    '/get-all',
    branchController.getAllBranch
);


router.get(
    '/:branchId/branch-details',
    auth(
        ENUM_USER_ROLE.SUPER_ADMIN,
        ENUM_USER_ROLE.ADMIN
    ),
    branchController.getBranchById
);

router.patch(
    '/:branchId/update-status',
    auth(
        ENUM_USER_ROLE.SUPER_ADMIN,
        ENUM_USER_ROLE.ADMIN
    ),
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