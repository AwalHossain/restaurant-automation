import { Request, Response } from 'express';
import httpStatus from 'http-status';
import ApiError from '../../../../../errors/ApiError';
import catchAsync from '../../../../../shared/catchAsync';
import sendResponse from '../../../../../shared/sendResponse';
import { CartService } from '../services/cart.service';

export class CartController {
  constructor(
    private cartService: CartService
  ) {
    this.cartService = new CartService();
  }

  addToCart = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new ApiError(400, 'User not found');
    }
    const result = await this.cartService.addToCart(req.body, userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Item added to cart successfully',
      data: result
    });
  });

  getCart = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new ApiError(400, 'User not found');
    }
    const result = await this.cartService.getCart(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Cart retrieved successfully',
      data: result
    });
  });

  updateCartItem = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { cartItemId } = req.params;
    const { quantity, addons } = req.body;
    if (!userId) {
      throw new ApiError(400, 'User not found');
    }

    const data = {
      addons,
      quantity,
      cartItemId
    }
    const result = await this.cartService.updateCartItemQuantity(
      data,
      userId
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Cart item updated successfully',
      data: result
    });
  });

  removeCartItem = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { cartItemId } = req.params;
    if (!userId) {
      throw new ApiError(400, 'User not found');
    }
    await this.cartService.removeCartItem(cartItemId, userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Cart item removed successfully',
      data: {}
    });
  });

  clearCart = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new ApiError(400, 'User not found');
    }
    await this.cartService.clearCart(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Cart cleared successfully',
      data: []
    });
  });
} 