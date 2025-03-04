import { Request, Response } from "express";
import catchAsync from "../../../../../shared/catchAsync";

import httpStatus from "http-status";
import sendResponse from "../../../../../shared/sendResponse";
import { UserRoleService } from "../services/userRoleService";

export class AssignRoleController {
    // private roleService: RoleService;
    private userRoleService: UserRoleService;


    constructor() {
        // this.roleService = new RoleService();
        this.userRoleService = new UserRoleService();
    }

    getUserRoles = catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.userId as string || req.params.id;
        const tenantId = req.tenantContext?.tenantId as string;

        const userRoles = await this.userRoleService.getUserRoles(userId, tenantId);
       

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "User roles fetched successfully",
            data: userRoles
        });





    });


}