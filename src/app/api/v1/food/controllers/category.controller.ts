import catchAsync from "../../../../../shared/catchAsync";
import sendResponse from "../../../../../shared/sendResponse";

import { Request, Response } from "express";
import httpStatus from "http-status";
import { AddSubCategoryInput, CreateCategoryInput, UpdateCategoryWithSubsInput } from "../dtos/category.dto";
import { CategoryService } from "../services/category.services";



export class CategoryController {
    private readonly categoryService: CategoryService;
    constructor() {
        this.categoryService = new CategoryService();
    }

    createCategory = catchAsync(async (req: Request, res: Response) => {
        const { body } = req;

        const result = await this.categoryService.createCategory(body as CreateCategoryInput);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Category created successfully',
            data: result
        })
    })


    getAllCategories = catchAsync(async (req: Request, res: Response) => {
        const result = await this.categoryService.getAllCategories();
        return res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            data: result
        });
    }); 


    getCategoryWithChildren = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await this.categoryService.getCategoryWithChildren(id);
        return res.status(200).json({
            success: true,
            message: "Category fetched successfully",
            data: result
        });
    });

    addSubCategory = catchAsync(async (req: Request, res: Response) => {
        const { body } = req;
        const result = await this.categoryService.addSubCategory(body as AddSubCategoryInput);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Sub category added successfully',
            data: result
        })
    })

    updateCategoryWithSubs = catchAsync(async (req: Request, res: Response) => {
        const { body } = req;
        const result = await this.categoryService.updateCategoryWithSubs(body as UpdateCategoryWithSubsInput);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Category updated successfully',
            data: result
        })
    })



 
}
