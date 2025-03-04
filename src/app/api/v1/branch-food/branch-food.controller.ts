import { Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import ApiError from "../../../../errors/ApiError";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import { BranchFoodService } from "./branch-food.service";
import { BranchFoodValidationService } from "./branch-food.validation";
export class BranchFoodController {
    private readonly branchFoodService: BranchFoodService
    private readonly branchFoodValidationService: BranchFoodValidationService
  constructor(
  ) {
    this.branchFoodService = new BranchFoodService();
    this.branchFoodValidationService = new BranchFoodValidationService();
  }

  // create branch food
  createBranchFood = catchAsync(async (req: Request, res: Response) => {
    // const images = await this.imageService.uploadFoodImage(file);
    const { body } = req;
    const userId = req.user?.userId;
    const tenantId = req.tenantContext?.tenantId;
    const branchId = req.tenantContext?.branchId;
    const restaurantId = req.tenantContext?.restaurantId;

    const result = await this.branchFoodService.createBasicBranchFood({ ...body, userId, tenantId, branchId, restaurantId });

    return res.status(201).json({
      success: true,
      message: "Food created successfully",
      data: result
    });

    // const { body } = req;
    // const result = await this.foodService.createFood(body);
    // return res.status(201).json({
    //     success: true,
    //     message: "Food created successfully",
    // });
  });

  // add variants
  addBranchFoodVariants = catchAsync(async (req: Request, res: Response) => {
    const { variants, foodId } = req.body;
    const tenantId = req.tenantContext?.tenantId;
    const branchId = req.tenantContext?.branchId;
    const restaurantId = req.tenantContext?.restaurantId;

    if(!tenantId){
      throw new ApiError(httpStatus.BAD_REQUEST, "Tenant ID is required");
    }

    const result = await this.branchFoodService.addBranchFoodVariants(foodId as string, tenantId as string, branchId as string, variants );
    return res.status(201).json({
      success: true,
      message: "Variants added successfully",
      data: result
    });
  });


  // update branch food details
  updateBranchFoodDetails = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const tenantId = req.tenantContext?.tenantId;
    const branchId = req.tenantContext?.branchId
    const restaurantId = req.tenantContext?.restaurantId;
    const foodId = req.params.foodId;
    const { body } = req;

    
    // Initialize update data
    let updateData: any = {
      foodId,
      updatedById: userId,
      tenantId,
      branchId,
      restaurantId,
      userId,
      ...body

    };



    const result = await this.branchFoodService.updateBranchFoodDetails(updateData);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Food details updated successfully",
      data: result
    });
  });


  // get all food from all branches
  getAllFoods = catchAsync(async (req: Request, res: Response) => {
    const tenantId = req.tenantContext?.tenantId;
    const branchId = req.tenantContext?.branchId;
    const user = {
      ...req.user,
      permissions: req.tenantContext?.userPermissions?.allPermissions || [],
      branchId: branchId as string
    } as JwtPayload
    
    const result = await this.branchFoodService.getAllFoods(tenantId as string, user);


    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Foods fetched successfully",
      data: result
    });
  });

  // get  food list by branch id
  getAllFoodsbyBranchId = catchAsync(async (req: Request, res: Response) => {
    const branchId = req.tenantContext?.branchId;
    const tenantId = req.tenantContext?.tenantId;

    const result = await this.branchFoodService.getAllFoodsbyBranchId(tenantId as string,branchId as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Foods fetched successfully by branch id",
      data: result
    });
  });

  // get branch food by id
  getBranchFoodById = catchAsync(async (req: Request, res: Response) => {
    const { foodId } = req.query
    const tenantId = req.tenantContext?.tenantId;
    const branchId = req.tenantContext?.branchId;
    const restaurantId = req.tenantContext?.restaurantId;

    const result = await this.branchFoodService.getBranchFoodById(foodId as string, tenantId as string, branchId as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Get Branch Food by ID fetched successfully",
      data: result
    });
  });

  getBranchFoodByMainCategoryId = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.query;
    const tenantId = req.tenantContext?.tenantId;
    const restaurantId = req.tenantContext?.restaurantId;
    const branchId = req.tenantContext?.branchId;
    if(!tenantId || !restaurantId){
      throw new ApiError(httpStatus.BAD_REQUEST, "Tenant ID or Restaurant ID is required");
    }
    const result = await this.branchFoodService.getBranchFoodByMainCategoryId(id as string, tenantId, branchId as string);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Food fetched successfully",
      data: result
    });
  });

  getBranchFoodBySubCategoryId = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.query;
    const tenantId = req.tenantContext?.tenantId;
    const restaurantId = req.tenantContext?.restaurantId;
    const branchId = req.tenantContext?.branchId;
    if(!tenantId || !restaurantId){

      throw new ApiError(httpStatus.BAD_REQUEST, "Tenant ID or Restaurant ID is required");
    }
    const result = await this.branchFoodService.getBranchFoodBySubCategoryId(id as string, tenantId, branchId as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Food fetched successfully",
      data: result
    });
  });

  getBranchFoodByCategoryId = catchAsync(async (req: Request, res: Response) => {
    const { id} = req.query;
    const tenantId = req.tenantContext?.tenantId;
    const restaurantId = req.tenantContext?.restaurantId;
    const branchId = req.tenantContext?.branchId;
    if(!tenantId || !restaurantId){
      throw new ApiError(httpStatus.BAD_REQUEST, "Tenant ID or Restaurant ID is required");
    }
    const result = await this.branchFoodService.getBranchFoodsByCategory(id as string, tenantId, branchId as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Food fetched successfully",
      data: result
    });
  });




}
