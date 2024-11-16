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
}
