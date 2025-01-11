import { Role } from "@prisma/client";
import express from "express";
import { branchAuth } from "../../../../middlewares/auth";
import auth from "../../../../middlewares/auth/auth-middleware";
import { BranchStaffController } from "../controllers/branch-staff.controller";


const router = express.Router();

const branchStaffController = new BranchStaffController();

// add staff to branch
router.post('/:branchId/add-staff-to-branch', auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER), 
branchAuth([Role.ADMIN, Role.MANAGER]),
branchStaffController.addStaffToBranch
);

// remove staff from branch
router.delete('/:branchId/remove-staff-from-branch/:staffId', auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER), 
branchAuth([Role.ADMIN, Role.MANAGER]),
branchStaffController.removeStaffFromBranch
);

// update staff role
router.patch('/:branchId/update-staff-role/:staffId', 
auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER), 
branchAuth([Role.ADMIN, Role.MANAGER]),
branchStaffController.updateStaffRole
);

// get branch available staff
router.get('/:branchId/get-branch-staff', auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER), 
branchAuth([Role.ADMIN, Role.MANAGER, Role.MODERATOR]),
branchStaffController.getAvailableStaffByBranchId
);

// get branch staff by id
router.get('/:branchId/get-branch-staff/:staffId', auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER), 
branchAuth([Role.ADMIN, Role.MANAGER, Role.MODERATOR]),
branchStaffController.getBranchStaffById
);

// get branch staff permissions
router.get('/:branchId/get-branch-staff-permissions', auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER), 
branchAuth([Role.ADMIN, Role.MANAGER, Role.MODERATOR]),
branchStaffController.getBranchStaffPermissions
);

export default router;

