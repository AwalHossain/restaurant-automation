import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import { CreateBranchInput, CreateRestaurantInput } from "../dtos/restaurant.dto";
import { RestaurantService } from "../services/restaurant.service";
import { RestaurantValidationService } from "../validations/restaurant.validation";


export class RestaurantController {
    constructor(
        private restaurantService: RestaurantService,
        private restaurantValidation: RestaurantValidationService

    ) {
        this.restaurantService = new RestaurantService();
        this.restaurantValidation = new RestaurantValidationService();
    }

    createRestaurant = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { body } = req;
        console.log("body", body);

        await this.restaurantValidation.validateCreateRestaurantInput(body as CreateRestaurantInput);
        
        const result = await this.restaurantService.createRestaurant(body as CreateRestaurantInput);
        
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "Restaurant created successfully",
            data: result
        });
    })


    getAllRestaurants = catchAsync(async (req: Request, res: Response) => {
        const result = await this.restaurantService.getAllRestaurants();
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Restaurants fetched successfully",
            data: result
        });
    })

    getRestaurantByDomain = catchAsync(async (req: Request, res: Response) => {
        const { domain } = req.params;

        const result = await this.restaurantService.getRestaurantByDomain(domain as string);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Restaurant fetched successfully",
            data: result
        });
    })

    createBranch = catchAsync(async (req: Request, res: Response) => {
        const { body } = req;
        const result = await this.restaurantService.createBranch(body as CreateBranchInput);
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "Branch created successfully",
            data: result
        });
    })

    getAllBranches = catchAsync(async (req: Request, res: Response) => {
        const { restaurantId } = req.params;
        const result = await this.restaurantService.getAllBranches(restaurantId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Branches fetched successfully",
            data: result
        });
    })

    getBranchById = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await this.restaurantService.getBranchById(id);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Branch fetched successfully",
            data: result
        });
    })
}
