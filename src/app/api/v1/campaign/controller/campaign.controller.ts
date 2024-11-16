import { Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../../../../../errors/ApiError";
import { ImageService } from "../../../../../services/foodImage.services";
import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";
import { CampaignService } from "../services/campaign.service";



export  class CampaignController {
    private campaignService: CampaignService;
    private imageService: ImageService;
    constructor() {
        this.campaignService = new CampaignService();
        this.imageService = new ImageService();
    }

     createCampaign = catchAsync(async (req: Request, res: Response) => {
        const image = req.file;
        if (!image) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Image is required");
        }
        const images = await this.imageService.uploadFoodImage(image);
        const {data} = req.body;
        const jsonData = JSON.parse(data);
        console.log(jsonData, "jsonData");
        const result = await this.campaignService.createCampaign({...jsonData, images});
        

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Campaign created successfully",
            data: result
        })
    })

    updateCampaign = catchAsync(async (req: Request, res: Response) => {
        const result = await this.campaignService.updateCampaign(req.params.id, req.body);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Campaign updated successfully",
            data: result
        })
    })

    deleteCampaign = catchAsync(async (req: Request, res: Response) => {
        const result = await this.campaignService.deleteCampaign(req.params.id);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Campaign deleted successfully",
            data: result
        })
    })

    getCampaignById = catchAsync(async (req: Request, res: Response) => {
        const result = await this.campaignService.getCampaign(req.params.id);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Campaign fetched successfully",
            data: result
        })
    })

    getAllCampaigns = catchAsync(async (req: Request, res: Response) => {
        const result = await this.campaignService.getAllCampaigns();
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Campaigns fetched successfully",
            data: result
        })
    })
    
}
