import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../../../shared/catchAsync';
import sendResponse from '../../../../../shared/sendResponse';
import { AdminAuthService } from '../services/auth.service';

const authService = new AdminAuthService();

export class AdminAuthController {
  register = catchAsync(async (req: Request, res: Response) => {
    const {user,accessToken,refreshToken} = await authService.register(req.body);

     // Set cookies
     res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Admin registered successfully",
      data: user,
    });
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await authService.login(req.body);

    // Set cookies
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: user
    });

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Admin logged in successfully",
      data: user,
    });
  });
}