import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../../../shared/catchAsync";
import { prisma } from "../../../../../shared/prisma";
import sendResponse from "../../../../../shared/sendResponse";
import { CreateRoleDto } from "../dtos/role.dto";
import { RoleService } from "../services/role.service";

export class RoleController {
    private roleService: RoleService;

    constructor() {
        this.roleService = new RoleService();
    }

    createRole = catchAsync(async (req: Request, res: Response) => {
        const input: CreateRoleDto = req.body;
        const tenantId = req.tenantContext?.tenantId;
        input.tenantId = tenantId as string;

        let role: any;

        const tx = await prisma.$transaction(
            async (tx) => {
                role = await this.roleService.createRole(tx, input);
                return role;
            }
        );

       
        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "Role created successfully",
            data: role
        });
    })


    getAllRoles = catchAsync(async (req: Request, res: Response) => {
        const tenantId = req.tenantContext?.tenantId;
        const roles = await this.roleService.getAllRoles(tenantId as string);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Roles fetched successfully",
            data: roles
        });
    })

    getAllRolesWithPermissions = catchAsync(async (req: Request, res: Response) => {
        const tenantId = req.tenantContext?.tenantId;
        const roles = await this.roleService.getAllRolesWithPermissions(tenantId as string);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Roles fetched successfully",
            data: roles
        });
    })


    getAllPermissions = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const tenantId = req.tenantContext?.tenantId;
        
        const permissions = await this.roleService.getAllPermissionsOfRole(id, tenantId as string);
        
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Role permissions fetched successfully",
            data: permissions
        });
    })

    // createDefaultRoles = catchAsync(async (req: Request, res: Response) => {
    //     const tenantId = req.tenantContext?.tenantId;
        
    //     const roles = await this.roleService.createDefaultRole(tenantId as string);
        
    //     sendResponse(res, {
    //         statusCode: httpStatus.CREATED,
    //         success: true,
    //         message: "Default roles created successfully",
    //         data: roles
    //     });
    // })
}