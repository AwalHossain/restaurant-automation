import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import { CreatePermissionDto } from "../dtos/permission.dto";
import { PermissionService } from "../services/permission.service";



export class PermissionController {
    private permissionService: PermissionService;

    constructor() {
        this.permissionService = new PermissionService();
    }

     createPermission = catchAsync(async (req: Request, res: Response) => {
        const input: CreatePermissionDto = req.body;
        const tenantId = req.tenantContext?.tenantId;
        const userId = req.user?.userId;
        input.tenantId = tenantId as string;

        const permission = await this.permissionService.createPermission(input);
       
        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "Permission created successfully",
            data: permission
        });

    })


    getPermissions = catchAsync(async (req: Request, res: Response) => {
        const { permissionName } = req.query;
        const tenantId = req.tenantContext?.tenantId;
        const permissions = await this.permissionService.getPermissions({
            search: permissionName as string,

            tenantId: tenantId as string
        });
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Permissions fetched successfully",
            data: permissions
        });
    })

    getAllPermissions = catchAsync(async (req: Request, res: Response) => {
        const tenantId = req.tenantContext?.tenantId;
        const permissions = await this.permissionService.getAllPermissions(tenantId as string);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "All permissions fetched successfully",
            data: permissions
        });
    });


    getPermissionById = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const tenantId = req.tenantContext?.tenantId;
        const permission = await this.permissionService.getPermissionById(id, tenantId as string);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Permission fetched successfully",
            data: permission
        });
    })


} 