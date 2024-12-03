import { Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../../../../../errors/ApiError";
import { AddOnImageService } from "../../../../../services/addonImage.service";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import { AddOnService } from "../services/addon.service";
import { AddOnValidationService } from "../validation/addon-validation.service";



export class AddonController {
    constructor(
        private readonly addOnService: AddOnService,
        private readonly addOnImageService: AddOnImageService,
        private readonly addOnValidationService: AddOnValidationService
    ) {
        this.addOnService = addOnService;
        this.addOnImageService = addOnImageService;
        this.addOnValidationService = addOnValidationService;

    }

    createAddon = catchAsync(async (req: Request, res: Response) => {       
        const { file } = req;
        if(!file) throw new ApiError(400, 'Image is required');
        const images = await this.addOnImageService.uploadFoodImage(file);
        const { body } = req;
        const data = JSON.parse(body.data);
        const {userId} = req.user as { userId: string };
        console.log(images, 'data');
        data.imageUrl = images.imageUrl;
        data.imageSize = images.imageSize;
        
        const result = await this.addOnService.createAddOn({...data, images}, userId);


            sendResponse(res, {
                statusCode: httpStatus.CREATED,
                success: true,
                message: "Addon created successfully",
            data: result
        });
    });

    getAddOns = catchAsync(async (req: Request, res: Response) => {
        const result = await this.addOnService.getAddOns();
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Addons fetched successfully",
            data: result,
        });
    });

    getAddOnById = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await this.addOnService.getAddOnById(id);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Addon fetched successfully",
            data: result,
        });
    });

    updateAddOn = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { body } = req;
        const result = await this.addOnService.updateAddOn(id, body);
    });

    
    createAddOnGroup = catchAsync(async (req: Request, res: Response) => {
        const { body } = req;
        const {userId} = req.user as { userId: string };
        console.log(body, userId);
        await this.addOnValidationService.validateCreateAddonInput(body);
        const result = await this.addOnService.createAddOnGroup(body, userId);
        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "Addon group created successfully",
            data: result,
        });
    });

    getAddOnGroups = catchAsync(async (req: Request, res: Response) => {
        const result = await this.addOnService.getAddonGroups();
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Addon groups fetched successfully",
            data: result,
        });
    });

    getAddOnGroupById = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await this.addOnService.getAddonGroupById(id);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Addon group fetched successfully",
            data: result,
        });
    });

    updateAddOnGroup = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { body } = req;
        const result = await this.addOnService.updateAddonGroup(id, body);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Addon group updated successfully",
            data: result,
        });
    });

    deleteAddOnGroup = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await this.addOnService.deleteAddonGroup(id);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Addon group deleted successfully",
            data: result,
        });
    });

}
