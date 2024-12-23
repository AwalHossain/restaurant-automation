import { Request, Response } from 'express';
import httpStatus from 'http-status';
import ApiError from '../../../../../errors/ApiError';
import catchAsync from '../../../../../shared/catchAsync';
import sendResponse from '../../../../../shared/sendResponse';
import { CheckoutService } from '../services/checkout.services';

export class CheckoutController {
    private checkoutService: CheckoutService
  constructor(
  ) {
    this.checkoutService = new CheckoutService();
  }

  calculateTotals = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new ApiError(400, 'User not found');
    }

    const result = await this.checkoutService.preCheckout(req.body, userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Checkout totals calculated successfully',
      data: result
    });
  });

  createCheckout = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new ApiError(400, 'User not found');
    }

    const result = await this.checkoutService.createCheckout(req.body, userId);

    console.log(result,">>>> result");
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Checkout created successfully',
      data: result
    });
  });

  preCheckout = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new ApiError(400, 'User not found');
    }

    const result = await this.checkoutService.preCheckout(req.body, userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Pre-checkout validation successful',
      data: result
    });
  });

  validatePromoCode = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new ApiError(400, 'User not found');
    }

    const result = await this.checkoutService.preCheckout(
      req.body,
      userId
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Promo code validated successfully',
      data: result
    });
  });

  validatePoints = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new ApiError(400, 'User not found');
    }

    const result = await this.checkoutService.preCheckout(req.body, userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Points validation successful',
      data: { pointsDiscount: result }
    });
  });

  getCheckoutByOrderId = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const checkoutId = req.params.id;
    if (!userId || !checkoutId) {
      throw new ApiError(400, 'Invalid request');
    }
    const result = await this.checkoutService.getCheckoutByOrderId(checkoutId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Checkout retrieved successfully',
      data: result
    });
  });

  getCheckoutByUserId = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new ApiError(400, 'User not found');
    }
    const result = await this.checkoutService.getCheckoutByUserId(userId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User Checkout retrieved successfully',
      data: result
    });
  });


  getAllCheckouts = catchAsync(async (req: Request, res: Response) => {
    const result = await this.checkoutService.getAllCheckouts();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Checkouts retrieved successfully',
      data: result
    });
  });

} 