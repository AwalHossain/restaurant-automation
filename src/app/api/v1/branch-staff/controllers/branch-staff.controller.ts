import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import { addStaffDto, updateStaffRoleDto } from "../dtos/branch-staff.dto";
import { BranchStaffService } from "../services/branch-staff.service";



export class BranchStaffController {
private readonly branchStaffService: BranchStaffService;

constructor() {
    this.branchStaffService = new BranchStaffService();
}


addStaffToBranch = catchAsync (async (req: Request, res: Response) => {
    console.log(req.body, req.params.branchId, "here i s the only solution");
    const branchId = req.body.branchId || req.params.branchId;
    const userId = req.body.userId || req.params.userId;
    const input = addStaffDto.parse({...req.body, userId, branchId});
    console.log(input,'input', req.body, req.params.branchId,"here", input);
    const result = await this.branchStaffService.addStaffToBranch(input);
    
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Staff added to branch successfully',
        data: result
    });
});


removeStaffFromBranch = catchAsync (async (req: Request, res: Response) => {
    const branchId = req.body.branchId || req.params.branchId;
    const userId = req.body.userId || req.params.userId;
    const result = await this.branchStaffService.removeStaffFromBranch(branchId, userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Staff removed from branch successfully',
        data: result
    });
});


getAvailableStaffByBranchId = catchAsync (async (req: Request, res: Response) => {
    const branchId = req.body.branchId || req.params.branchId;
    const result = await this.branchStaffService.getAvailableStaffByBranchId(branchId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Branch staff fetched successfully',
        data: result
    });
});

updateStaffRole = catchAsync (async (req: Request, res: Response) => {
    const branchId = req.body.branchId || req.params.branchId;
    const userId = req.body.userId || req.params.userId;
    console.log(req.body, req.params.branchId, req.params.userId, "here i s the only solution");
    const input = updateStaffRoleDto.parse({...req.body, userId, branchId});
    const result = await this.branchStaffService.updateStaffRole(input);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Staff role updated successfully',
        data: result
    });
});


getBranchStaffById = catchAsync (async (req: Request, res: Response) => {
    const {branchId} = req.params || req.body;
    const {userId} = req.user as {userId: string};
    const result = await this.branchStaffService.getBranchStaffById(branchId, userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Branch staff fetched successfully',
        data: result
    });
});

    getBranchStaffPermissions = catchAsync (async (req: Request, res: Response) => {
        const {userId} = req.user as {userId: string};
        const result = await this.branchStaffService.getBranchStaffPermissions(userId);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Branch staff permissions fetched successfully',
            data: result
        });
    });



}
