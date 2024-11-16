import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import { AddOnService } from "../services/addon.service";



export class AddonController {
    private readonly addOnService = new AddOnService();

    constructor() {
        this.addOnService = new AddOnService();
    }

    createAddon = catchAsync(async (req: Request, res: Response) => {       
        const { body } = req;
        const user = req.user;
        const result = await this.addOnService.createAddOn(body, user);


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
}
