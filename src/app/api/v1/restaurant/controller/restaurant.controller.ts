import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import { CreateRestaurantInput } from "../dtos/restaurant.dto";
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
        const userId = req.user?.userId;
        body.userId = userId;

        body.adminId = userId;
        console.log(body, "body");
        await this.restaurantValidation.validateCreateRestaurantInput(body as CreateRestaurantInput);
        
        const result = await this.restaurantService.createRestaurant(body as CreateRestaurantInput, req);
        
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
        const tenantId = req.tenantContext?.tenantId;
        const result = await this.restaurantService.getRestaurantByDomain(domain as string);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Restaurant fetched successfully",
            data: result
        });
    })

    getRestaurantByTenantId = catchAsync(async (req: Request, res: Response) => {
        const tenantId = req.tenantContext?.tenantId;
        const result = await this.restaurantService.getRestaurantByTenantId(tenantId as string);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Restaurant fetched successfully",
            data: result
        });
    })

    getAllBranches = catchAsync(async (req: Request, res: Response) => {
        const restaurantId = req.tenantContext?.restaurantId;
        const tenantId = req.tenantContext?.tenantId;
        const result = await this.restaurantService.getAllBranches(restaurantId as string, tenantId as string);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Branches fetched successfully",
            data: result
        });
    })

    getRestaurantByAdminId = catchAsync(async (req: Request, res: Response) => {
        const adminId = req.user?.userId;
        const result = await this.restaurantService.getRestaurantByAdminId(adminId as string);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Restaurant fetched successfully",
            data: result
        });
    })

    // update restaurant settings
    updateRestaurantSettings = catchAsync(async (req: Request, res: Response) => {
        const { body } = req;
        const tenantId = req.tenantContext?.tenantId;
        const restaurantId = req.tenantContext?.restaurantId;
        body.restaurantId = restaurantId;
        body.tenantId = tenantId;
        const result = await this.restaurantService.updateRestaurantSettings(body);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Restaurant settings updated successfully",
            data: result
        });
    })

    // update points system
    updatePointsSystem = catchAsync(async (req: Request, res: Response) => {
        const { body } = req;
        const tenantId = req.tenantContext?.tenantId;
        const restaurantId = req.tenantContext?.restaurantId;
        body.restaurantId = restaurantId;
        body.tenantId = tenantId;
        const result = await this.restaurantService.updateRestaurantPointsSystem(body);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Points system updated successfully",
            data: result
        });
    })

}
