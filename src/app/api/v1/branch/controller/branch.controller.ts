import { Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../../../../../errors/ApiError";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import { BranchService } from "../services/banch.services";
import { BranchValidationService } from "../validation/branch.validation";


export class BranchController {
    private branchService: BranchService  
    constructor(
    ) {
      this.branchService = new BranchService(new BranchValidationService());
    }

    createBranch = catchAsync(async (req: Request, res: Response) => {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(400, 'User not found');
      }
      const result = await this.branchService.createBranch(req.body, userId, req);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Branch created successfully",
        data: result
      })
    })

    updateBranchBasicInfo = catchAsync(async (req: Request, res: Response) => {
      const userId = req.user?.userId;
      const branchId = req.params.branchId;
      const {body} = req;
      if (!userId) {
        throw new ApiError(400, 'User not found');
      }
      body.branchId = branchId;
      body.userId = userId;
      body.req = req;
      const result = await this.branchService.updateBranchBasicInfo(body);
     
     
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Branch basic info updated successfully",
        data: result
      })
    })

    updateBranchDeliverySettings = catchAsync(async (req: Request, res: Response) => {
      const userId = req.user?.userId;
      const branchId = req.params.branchId;
      const {body} = req;
      if (!userId) {
        throw new ApiError(400, 'User not found');
      }
      body.branchId = branchId;
      body.userId = userId;
      body.req = req;
      const result = await this.branchService.updateBranchDeliverySettings(body);
   
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Branch delivery settings updated successfully",
        data: result
      })
    })

    updateBranchBusinessHours = catchAsync(async (req: Request, res: Response) => {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(400, 'User not found');
        
      }

      const inputData = {
        branchId: req.params.branchId,
        businessHours: req.body.businessHours,
        userId: userId,
        req: req
      }
      const result = await this.branchService.updateBranchBusinessHours(inputData);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Branch business hours updated successfully",
        data: result
      })
    })

    getAllBranch = catchAsync(async (req: Request, res: Response) => {
      const result = await this.branchService.getAllBranch();

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Branch fetched successfully",
        data: result
      })
    })

    getBranchById = catchAsync(async (req: Request, res: Response) => {
      const result = await this.branchService.getBranchById(req.params.branchId);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Branch fetched successfully",
        data: result
      })
    })

    updateBranchStatus = catchAsync(async (req: Request, res: Response) => {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(400, 'User not found');
      }

      const inputData = {
        branchId: req.params.branchId,
        userId: userId,
        req: req
      }
      const result = await this.branchService.updateBranchStatus(inputData);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Branch status updated successfully",
        data: result
      })
    })

    deleteBranch = catchAsync(async (req: Request, res: Response) => {
      const userId = req.user?.userId;  
      if (!userId) {
        throw new ApiError(400, 'User not found');
      }
      const result = await this.branchService.deleteBranch(req.params.branchId, userId);
  
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Branch deleted successfully",
        data: result
      })
    })

    getAllActiveBranch = catchAsync(async (req: Request, res: Response) => {
      const result = await this.branchService.getAllActiveBranch();

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Branch fetched successfully",
        data: result
      })
    })
}