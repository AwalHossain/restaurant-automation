import { Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../../../../../errors/ApiError";
import { ImageService } from "../../../../../services/image.services";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import { FoodService } from "../services/food.services";



export class FoodController {
    private readonly foodService: FoodService;
    private readonly imageService: ImageService;
    constructor() {
        this.foodService = new FoodService();
        this.imageService = new ImageService();
    }

    createFood = catchAsync(async (req: Request, res: Response) => {
        const { file } = req;
        if(!file) throw new ApiError(400, 'Image is required');
        const images = await this.imageService.uploadFoodImage(file);
        const { body } = req;
        console.log(body, 'body');
        const data = JSON.parse(body.data);
        console.log(data, 'data');
        const result = await this.foodService.createFood({...data, images});
        console.log(result, 'result');
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


    updateFoodDetails = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { body } = req;
        const result = await this.foodService.updateFoodDetails({...body, id});
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Food details updated successfully',
            data: result
        })
    });

    getAllFoods = catchAsync(async (req: Request, res: Response) => {
        const result = await this.foodService.getAllFoods();
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Foods fetched successfully',
            data: result
        })
    });

}
