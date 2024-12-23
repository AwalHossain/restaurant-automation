import { Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../../../../../errors/ApiError";
import { ImageService } from "../../../../../services/foodImage.services";
import catchAsync from "../../../../../shared/catchAsync";
import { PromotionService } from "../services/promotion.services";

export class PromotionController {
  // private promotionService: PromotionService;
  constructor(
    private imageService: ImageService,
    private promotionService: PromotionService
  ) {
    // this.promotionService = new PromotionService();
    this.imageService = new ImageService();
  }

  createPromotion = catchAsync(async (req: Request, res: Response) => {
    const image = req.file;
    if (!image) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Image is required");
    }
    const images = await this.imageService.uploadFoodImage(image);
    const { data } = req.body;
    const jsonData = JSON.parse(data);
    console.log(jsonData, "jsonData");
    const resulty = await this.promotionService.createPromotion({ ...jsonData, images });
    res.status(httpStatus.CREATED).json({
      success: true,
      message: "Promotion created successfully",
      data: resulty
    });
  });


  getPromotionFoods = catchAsync(async (req: Request, res: Response) => {
    const { promotionId } = req.params;
    const result = await this.promotionService.getPromotionFoods(promotionId);
    res.status(httpStatus.OK).json({
      success: true,
      message: "Promotion foods retrieved successfully",
      data: result
    });
  });

  updatePromotion = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const image = req.file;
    let images;

    if (image) {
      images = await this.imageService.uploadFoodImage(image);
    }

    const { data } = req.body;
    const jsonData = JSON.parse(data);

    const result = await this.promotionService.updatePromotion(id, {
      ...jsonData,
      images
    });

    res.status(httpStatus.OK).json({
      success: true,
      message: "Promotion updated successfully",
      data: result
    });
  });

  getActivePromotions = catchAsync(async (req: Request, res: Response) => {
    const result = await this.promotionService.getActivePromotions();
    res.status(httpStatus.OK).json({
      success: true,
      message: "Active promotions retrieved successfully",
      data: result
    });
  });

  getUpcomingPromotions = catchAsync(async (req: Request, res: Response) => {
    const result = await this.promotionService.getUpcomingPromotions();
    res.status(httpStatus.OK).json({
      success: true,
      message: "Upcoming promotions retrieved successfully",
      data: result
    });
  });

  getUserPromotionHistory = catchAsync(async (req: Request, res: Response) => {
    // Assuming user ID is available from auth middleware
    const userId = req.user?.userId;
    if (!userId) throw new ApiError(httpStatus.BAD_REQUEST, "User ID is required");
    const result = await this.promotionService.getUserPromotionHistory(userId);
    res.status(httpStatus.OK).json({
      success: true,
      message: "User promotion history retrieved successfully",
      data: result
    });
  });

  checkPromotionEligibility = catchAsync(async (req: Request, res: Response) => {
    const { promotionId } = req.params;
    // Assuming user ID is available from auth middleware
    const userId = req.user?.userId;
    if (!userId) throw new ApiError(httpStatus.BAD_REQUEST, "User ID is required");

    const result = await this.promotionService.checkPromotionEligibility(userId, promotionId);

    res.status(httpStatus.OK).json({
      success: true,
      message: "Promotion eligibility checked successfully",
      data: result
    });
  });

  trackPromotionUsage = catchAsync(async (req: Request, res: Response) => {
    const { promotionId } = req.params;
    // Assuming user ID is available from auth middleware
    const userId = req.user?.userId;
    if (!userId) throw new ApiError(httpStatus.BAD_REQUEST, "User ID is required");

    const result = await this.promotionService.trackPromotionUsage(userId, promotionId);

    res.status(httpStatus.OK).json({
      success: true,
      message: "Promotion usage tracked successfully",
      data: result
    });
  });

  getPromotionById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.promotionService.getPromotionById(id);
    res.status(httpStatus.OK).json({
      success: true,
      message: "Promotion retrieved successfully",
      data: result
    });
  });
  
  getAllPromotions = catchAsync(async (req: Request, res: Response) => {
    const result = await this.promotionService.getAllPromotions();
    res.status(httpStatus.OK).json({
      success: true,
      message: "Promotions retrieved successfully",
      data: result
    });
  });
}