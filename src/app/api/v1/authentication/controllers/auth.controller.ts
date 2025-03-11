import { Request, Response } from 'express';
import httpStatus from 'http-status';
import ApiError from '../../../../../errors/ApiError';
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
      data: {
        ...user,
        accessToken,
        refreshToken
      },
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
      data: {
        ...user,
        accessToken,
        refreshToken
      },
    });
  });


   // Admin registration (username/password based)
   staffRegister = catchAsync(async (req: Request, res: Response) => {
    const {roleId, branchId} = req.body;
    const credentials = this.buildUnifiedCredentials(req);
    const context = req.tenantContext;
    
    if(!context?.tenantId ){
      throw new ApiError(400, "Tenant context is required");
    }
    const tenantId = context.tenantId;
    const restaurantId = context.restaurantId;
    if(!tenantId && !restaurantId){
      throw new ApiError(400, "Tenant and restaurant context is required");
    }
    const data = {
      identifier: credentials.identifier,
      password: credentials.password,
      type: credentials.type,
      branchId: branchId,
      roleId,
      tenantId,
      restaurantId: restaurantId!
    }
    // const role = req.user?.role;
    const user = await this.authService.staffRegister(data);



    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Admin registered successfully",
      data: user
    });
  });

  // superAdminRegister = catchAsync(async (req: Request, res: Response) => {
  //   const {username, password, email, phone, role} = req.body;
  //   const { user, accessToken, refreshToken } = await this.authService.superAdminRegister({username, password, email, phone, role});
  
  //   sendResponse(res, {
  //     statusCode: httpStatus.CREATED,
  //     success: true,
  //     message: "Super Admin registered successfully",
  //     data: {
  //       ...user,
  //       accessToken,
  //       refreshToken
  //     },
  //   });
  // });
  adminRegister = catchAsync(async (req: Request, res: Response) => {
    const {username, password, email, phone} = req.body;
    const { user, accessToken, refreshToken } = await this.authService.adminRegister({username, password, email, phone});
  
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Super Admin registered successfully",
      data: {
        ...user,
        accessToken,
        refreshToken
      },
    });
  });

  //  // Admin login
   unifiedLogin = catchAsync(async (req: Request, res: Response) => {
    const credentials = this.buildUnifiedCredentials(req);
    const { ...rest} = await this.authService.unifiedLogin(credentials);

    // ... existing cookie setting code ...
  // Set cookies
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "logged in successfully",
      data: {
        ...rest,
      },
    });
  });

  getUserContext = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const tenantId = req.tenantContext?.tenantId;
    if(!userId || !tenantId){
      throw new ApiError(400, `${userId ? "UserID" : "Tenant ID"} is required`);
    }
    const context = await this.authService.getUserContext(userId, tenantId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User context fetched successfully",
      data: context
    });
  });
  

// superAdminLogin = catchAsync(async (req: Request, res: Response) => {
//     const {email, password} = req.body;

//     const data = {email, password}
//     const { user, accessToken, refreshToken } = await this.authService.adminLogin(data);
  
//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: "Super Admin logged in successfully",
//       data: {
//         ...user,
//         accessToken,
//         refreshToken
//       },
//     });
//   });

// adminLogin = catchAsync(async (req: Request, res: Response) => {
//   const credentials = this.buildUnifiedCredentials(req);
//     const { user, accessToken, refreshToken } = await this.authService.unifiedLogin(credentials);
  
//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: "Super Admin logged in successfully",
//       data: {
//         ...user,
//         accessToken,
//         refreshToken
//       },
//     });
//   });




  selectRole = catchAsync(async (req: Request, res: Response) => {
    const roleOption = req.headers['role-option'] as string;
    const userId = req.user?.userId;
    const deviceId = req.headers['device-id'] as string;
    const tenantId = req.tenantContext?.tenantId;

    console.log(userId, deviceId, tenantId, roleOption, "userId, deviceId, tenantId, roleOption");
    if (!userId || !deviceId || !tenantId) {
      throw new ApiError(400, "Missing required information");
    }

    const result = await this.authService.selectRole(
      userId,
      tenantId,
      roleOption,
      deviceId
    );

    // Set new tokens
    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Role selected successfully",
      data: result
    });
  });

  switchRole = catchAsync(async (req: Request, res: Response) => {
    const roleOption = req.headers['role-option'] as string;
    const userId = req.user?.userId;
    const deviceId = req.headers['device-id'] as string;
    const tenantId = req.tenantContext?.tenantId;

    console.log(userId, deviceId, tenantId, "userId, deviceId, tenantId, roleOption");

    if (!userId || !deviceId || !tenantId) {
      throw new ApiError(400, "Missing required information");
    }

    const result = await this.authService.switchRole(
      userId,
      tenantId,
      roleOption,
      deviceId
    );

    // Set new tokens
    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Role switched successfully",
      data: result
    });
  });

  private determineCredentialType(body: any): 'EMAIL' | 'USERNAME' | 'PHONE' {
    if (body.email) return 'EMAIL';
    if (body.phone) return 'PHONE';
    return 'USERNAME';
  }
  private buildUnifiedCredentials(req: Request) {
    const { email, phone, username, password } = req.body;
    const tenantId = req.tenantContext?.tenantId as string;
    
    const type = this.determineCredentialType(req.body);
    const identifier = email || phone || username;

    return {
      identifier,
      password,
      tenantId,
      type
    };
  }

}
