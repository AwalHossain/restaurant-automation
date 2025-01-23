import { Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../../../../../errors/ApiError";
import { ImageService } from "../../../../../services/foodImage.services";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import { FoodService } from "../services/food.services";
import { FoodValidationService } from "../validation/food-validation.service";

export class FoodController {
  constructor(
    private readonly foodService: FoodService,
    private readonly imageService: ImageService,
    private readonly foodValidationService: FoodValidationService
  ) {
    this.foodService = foodService;
    this.imageService = imageService;
    this.foodValidationService = foodValidationService;
  }

  createFood = catchAsync(async (req: Request, res: Response) => {
    // const images = await this.imageService.uploadFoodImage(file);
    const { body } = req;
    const userId = req.user?.userId;
    const tenantId = req.tenantContext?.tenantId;
    const branchId = req.tenantContext?.branchId;
    const restaurantId = req.tenantContext?.restaurantId;

    const result = await this.foodService.createBasicFood({ ...body, userId, tenantId, branchId, restaurantId });

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
  addVariants = catchAsync(async (req: Request, res: Response) => {
    const { variants, foodId } = req.body;

    const result = await this.foodService.addFoodVariants(foodId, variants);
    return res.status(201).json({
      success: true,
      message: "Variants added successfully",
      data: result
    });
  });



  updateFoodDetails = catchAsync(async (req: Request, res: Response) => {
    const { file } = req;
    const { id } = req.params;
    const userId = req.user?.userId;
    const tenantId = req.tenantContext?.tenantId;
    const branchId = req.tenantContext?.branchId;
    const restaurantId = req.tenantContext?.restaurantId;

    
    // Initialize update data
    let updateData: any = {
      id,
      updatedBy: userId,
      tenantId,
      branchId,
      restaurantId
    };


    // If there's form data, parse it
    if (req.body.data) {
 
        const parsedData = JSON.parse(req.body.data);
        console.log(parsedData, "parsedData");

        updateData = { ...updateData, ...parsedData };
        console.log(updateData, "updateData");
        const result = await this.foodValidationService.validateUpdateFoodInput(updateData);
        console.log(result, "result");
        

    }

    const result = await this.foodService.updateFoodDetails(updateData);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Food details updated successfully",
      data: result
    });
  });

  getAllFoods = catchAsync(async (req: Request, res: Response) => {
    const { branchId } = req.params;
    const result = await this.foodService.getAllFoods(branchId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Foods fetched successfully",
      data: result
    });
  });

  getFoodById = catchAsync(async (req: Request, res: Response) => {
    const { foodId, branchId } = req.query
    const tenantId = req.tenantContext?.tenantId;
    const restaurantId = req.tenantContext?.restaurantId;
    if(!tenantId || !restaurantId){
      throw new ApiError(httpStatus.BAD_REQUEST, "Tenant ID or Restaurant ID is required");
    }
    const result = await this.foodService.getFoodById(foodId as string, tenantId, branchId as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Get Food fetched successfully",
      data: result
    });
  });

  getFoodByMainCategoryId = catchAsync(async (req: Request, res: Response) => {
    const { branchId, categoryId } = req.query;
    const tenantId = req.tenantContext?.tenantId;
    const restaurantId = req.tenantContext?.restaurantId;
    if(!tenantId || !restaurantId){
      throw new ApiError(httpStatus.BAD_REQUEST, "Tenant ID or Restaurant ID is required");
    }
    const result = await this.foodService.getFoodByMainCategoryId(categoryId as string, tenantId, branchId as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Food fetched successfully",
      data: result
    });
  });

  getFoodBySubCategoryId = catchAsync(async (req: Request, res: Response) => {
    const { branchId, categoryId } = req.query;
    const tenantId = req.tenantContext?.tenantId;
    const restaurantId = req.tenantContext?.restaurantId;
    if(!tenantId || !restaurantId){
      throw new ApiError(httpStatus.BAD_REQUEST, "Tenant ID or Restaurant ID is required");
    }
    const result = await this.foodService.getFoodBySubCategoryId(categoryId as string, tenantId, branchId as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Food fetched successfully",
      data: result
    });
  });

  getFoodByCategoryId = catchAsync(async (req: Request, res: Response) => {
    const { branchId, categoryId } = req.query;
    const tenantId = req.tenantContext?.tenantId;
    const restaurantId = req.tenantContext?.restaurantId;
    if(!tenantId || !restaurantId){
      throw new ApiError(httpStatus.BAD_REQUEST, "Tenant ID or Restaurant ID is required");
    }
    const result = await this.foodService.getFoodsByCategory(categoryId as string, tenantId, branchId as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Food fetched successfully",
      data: result
    });
  });
}
