import { Request, Response } from "express";
import httpStatus from "http-status";
import sendResponse from "../../../../../shared/sendResponse";
import { addStaffDto, updateStaffDto } from "../dtos/branch-staff.dto";
import { BranchStaffService } from "../services/branch-staff.service";



export class BranchStaffController {
private readonly branchStaffService: BranchStaffService;

constructor() {
    this.branchStaffService = new BranchStaffService();
}


addStaffToBranch = async (req: Request, res: Response) => {

    const {branchId} = req.body || req.params;
    const {userId} = req.user as {userId: string};
    const input = addStaffDto.parse({...req.body, userId, branchId});
    const result = await this.branchStaffService.addStaffToBranch(input);
    
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Staff added to branch successfully',
        data: result
    });
}


removeStaffFromBranch = async (req: Request, res: Response) => {
    const {branchId} = req.body || req.params;
    const {userId} = req.user as {userId: string};
    const result = await this.branchStaffService.removeStaffFromBranch(userId, branchId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Staff removed from branch successfully',
        data: result
    });
}


getAvailableStaffByBranchId = async (req: Request, res: Response) => {
    const {branchId} = req.body || req.params;
    const result = await this.branchStaffService.getAvailableStaffByBranchId(branchId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Branch staff fetched successfully',
        data: result
    });
}

updateStaffRole = async (req: Request, res: Response) => {
    const {branchId} = req.body || req.params;
    const {userId} = req.user as {userId: string};
    const input = updateStaffDto.parse({...req.body, userId, branchId});
    const result = await this.branchStaffService.updateStaffRole(input);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Staff role updated successfully',
        data: result
    });
}


getBranchStaffById = async (req: Request, res: Response) => {
    const {branchId} = req.params || req.body;
    const {userId} = req.user as {userId: string};
    const result = await this.branchStaffService.getBranchStaffById(branchId, userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Branch staff fetched successfully',
        data: result
    });
}

    getBranchStaffPermissions = async (req: Request, res: Response) => {
        const {userId} = req.user as {userId: string};
        const result = await this.branchStaffService.getBranchStaffPermissions(userId);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Branch staff permissions fetched successfully',
            data: result
        });
    }



}
