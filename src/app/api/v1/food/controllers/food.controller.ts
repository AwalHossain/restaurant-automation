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
    const { file } = req;
    if (!file) throw new ApiError(400, "Image is required");
    const images = await this.imageService.uploadFoodImage(file);
    const { body } = req;
    const data = JSON.parse(body.data);
    const { userId } = req.user as { userId: string };
    const result = await this.foodService.createBasicFood({ ...data, images, userId });

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
    const { userId } = req.user as { userId: string };

    
    // Initialize update data
    let updateData: any = {
      id,
      updatedBy: userId
    };

    // If there's form data, parse it
    if (req.body.data) {
      try {
        const parsedData = JSON.parse(req.body.data);
        updateData = { ...updateData, ...parsedData };
        await this.foodValidationService.validateUpdateFoodInput(updateData);
      } catch (error) {
        throw new ApiError(400, "Invalid data format");
      }
    }

    // If there's a file, process it
    if (file) {
      const images = await this.imageService.uploadFoodImage(file);
      updateData.images = images;
    }

    // If neither data nor file is provided, throw error
    if (!file && !req.body.data) {
      throw new ApiError(400, "No updates provided");
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
    const result = await this.foodService.getAllFoods();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Foods fetched successfully",
      data: result
    });
  });

  getFoodById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.foodService.getFoodById(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Food fetched successfully",
      data: result
    });
  });

  getFoodByMainCategoryId = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.foodService.getFoodByMainCategoryId(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Food fetched successfully",
      data: result
    });
  });

  getFoodBySubCategoryId = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    console.log(id, "subcategory");
    const result = await this.foodService.getFoodBySubCategoryId(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Food fetched successfully",
      data: result
    });
  });

  getFoodByCategoryId = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.foodService.getFoodsByCategory(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Food fetched successfully",
      data: result
    });
  });
}
