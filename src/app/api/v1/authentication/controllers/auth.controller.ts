import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../../../shared/catchAsync';
import sendResponse from '../../../../../shared/sendResponse';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private authService = new AuthService();

   // Step 1: Initiate user registration with phone number
   initiateUserRegistration = catchAsync(async (req: Request, res: Response) => {
    const { phone } = req.body;
    const otp = await this.authService.initiateRegistration(phone);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "OTP sent successfully",
      data: `{${otp} and it will expire in 2 minutes}`
    });
  });

   // Step 2: Verify OTP
  verifyOTP = catchAsync(async (req: Request, res: Response) => {
    const { phone, otp } = req.body;
    console.log(phone, otp, "phone, otp");
    
    const isValid = await this.authService.verifyOTP(phone, otp);
    console.log(isValid, "isValid");

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "OTP verified successfully",
      data: { phone }
    });
  });

   // Step 3: Complete user registration
   completeUserRegistration = catchAsync(async (req: Request, res: Response) => {
    const { phoneNumber, name, password } = req.body;
    const { user, accessToken, refreshToken } = await this.authService.completeRegistration(req.body);

    // ... existing cookie setting code ...

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
      message: "User registered successfully",
      data: user,
    });
  });

  userLogin = catchAsync(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await this.authService.userLogin(req.body);

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
      message: "User logged in successfully",
      data: user,
    });
  });


   // Admin registration (username/password based)
   adminRegister = catchAsync(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await this.authService.adminRegister(req.body);

    // ... existing cookie setting code ...
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

   // Admin login
   adminLogin = catchAsync(async (req: Request, res: Response) => {
    console.log(req.body, "req.body");
    
    const { user, accessToken, refreshToken } = await this.authService.adminLogin(req.body);

    // ... existing cookie setting code ...
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
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin logged in successfully",
      data: user,
    });
  });


}
