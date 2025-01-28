import { BranchStaffRole, Role } from "@prisma/client";
import ApiError from "../../../../../errors/ApiError";
import { JwtUtils } from "../../../../../helpers/jwt.helper";
import { generateOTP } from "../../../../../helpers/otp.helper";
import { comparePassword, hashPassword } from "../../../../../helpers/password.helper";
import { prisma } from "../../../../../shared/prisma";
import { LoginUserInput, RegisterUserInput, StaffLoginInput, StaffRegisterInput, SuperAdminLoginInput, SuperAdminRegisterInput } from "../dtos/auth.dto";




export class AuthService {

  // Step 1: Initialize registration with phone number
  async initiateRegistration(phone: string) {
    // Validate phone number format (11 digits)
    if (!/^\d{11}$/.test(phone)) {
      throw new ApiError(400, 'Invalid phone number format');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone: phone }
    });

    if (existingUser) {
      throw new ApiError(400, 'Phone number already registered, please login');
    }

    const recentOtp = await prisma.oTP.count({
      where: { phone: phone,
        expiresAt: {
          gt: new Date(Date.now() - 5 * 60 * 1000)
        },
      }
    })

    if(recentOtp >= 3){
      throw new ApiError(400, 'Too many OTP requests, please try after 5 minutes');
    }

    // invalidate any existing OTP
 const invalidated = await prisma.oTP.updateMany({
      where: { phone: phone,
        used: false
      },
      data: { used: true },
      
    })
    console.log(invalidated, "invalidated");



    // Generate OTP
    const otp = generateOTP(); // Implement this helper function


    // Send OTP via SMS
  //  const data = await sendSMS(phone, `Your OTP is: ${otp} and it will expire in 2 minutes`);
  //       // Store OTP in database with expiration
        if(otp){
        await prisma.oTP.create({
      data:{
        phone: phone,
        code: otp,
        expiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes
        }
      })
    }
    return `Your OTP is ${otp} and it will expire in 2 minutes`;
  }

  // Step 2: Verify OTP
  async verifyOTP(phone: string, otp: string) {
    // First find the latest active OTP for this phone
    const latestOTP = await prisma.oTP.findFirst({
      where: {
        phone: phone,
        expiresAt: {
          gt: new Date()
        },
        used: false
      },
    });
  
    // If no active OTP exists
    if (!latestOTP) {
      throw new ApiError(400, 'No active OTP found');
    }
  
    // Check if max attempts reached
    if (latestOTP.otpAttempts >= 3 && latestOTP.expiresAt < new Date()) {
      throw new ApiError(429, 'Maximum attempts reached. Please request a new OTP');
    }
  
    // Increment the attempt counter
    const updatedOTP = await prisma.oTP.update({
      where: {
        id: latestOTP.id
      },
      data: {
        otpAttempts: {
          increment: 1
        }
      }
    });
  
    // Check if OTP matches
    if (latestOTP.code !== otp) {
      throw new ApiError(400, 'Invalid OTP');
    }
  
    // If OTP matches, mark as used
    await prisma.oTP.update({
      where: {
        id: latestOTP.id
      },
      data: {
        used: true
      }
    });
  
    return true;
  }
  // Step 3: Complete user registration
  async completeRegistration(input: RegisterUserInput) {

    // check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone: input.phone, isVerified: true }
    });

    if (existingUser) {
      throw new ApiError(400, 'Phone number already registered, please login');
    }

    // check if user verified or not
    const isVerified = await prisma.user.findUnique({
      where: { phone: input.phone, isVerified: true }
    });

    if (!isVerified) {
      throw new ApiError(400, 'User not verified, please verify your account');
    }

    const hashedPassword = await hashPassword(input.password!);

    const user = await prisma.user.create({
      data: {
          phone: input.phone,
          tenantId: input.tenantId,
        firstName: input.name,
        password: hashedPassword,
        role: Role.CUSTOMER,
      }
    });

    const accessToken = JwtUtils.generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = JwtUtils.generateRefreshToken({ userId: user.id, role: user.role });


    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    };
  }

// User login
async userLogin(input: LoginUserInput) {
  const user = await prisma.user.findUnique({
    where: { phone: input.phone }
  });

  if (!user || user.role !== Role.CUSTOMER) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isPasswordValid = await comparePassword(input.password, user.password!);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const accessToken = JwtUtils.generateAccessToken({ userId: user.id, role: user.role });
  const refreshToken = JwtUtils.generateRefreshToken({ userId: user.id, role: user.role });

  
  const { password, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken
  };
}

  // async login(input: LoginUserInput) {
  //   const user = await prisma.user.findUnique({
  //     where: { phone: input.phone }
  //   });
    

  //   // if (!user || (user.role !== Role.ADMIN ||  user.role !== Role.SUPER_ADMIN ||  user.role || Role.MANAGER)) {
  //   //   throw new ApiError(401, 'Invalid role doesn\'t match');
  //   // }

  //   const isPasswordValid = await comparePassword(input.password, user.password!);
  //   if (!isPasswordValid) {
  //     throw new ApiError(401, 'Invalid credentials');
  //   }

  //   const accessToken = JwtUtils.generateAccessToken({ userId: user.id, role: user.role });
  //   const refreshToken = JwtUtils.generateRefreshToken({ userId: user.id, role: user.role });

  //   await prisma.refreshToken.create({
  //     data: {
  //       token: refreshToken,
  //       userId: user.id,
  //       expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  //     }
  //   });

  //   const { password, ...userWithoutPassword } = user;
  //   return {
  //     user: userWithoutPassword,
  //     accessToken,
  //     refreshToken
  //   };
  // }

  // Admin registration
  async staffRegister(input: StaffRegisterInput) {
    const existingStaff = await prisma.user.findUnique({
      where: { username: input.username }
    });

    
    console.log(existingStaff, "existingStaff");
    

    if (existingStaff) {
      throw new ApiError(400, 'Username already exists');
    }

    const hashedPassword = await hashPassword(input.password);

    const staff = await prisma.user.create({
      data: {
        username: input.username,
        tenantId: input.tenantId,
        password: hashedPassword,
        role: input.role ?? BranchStaffRole.STAFF as BranchStaffRole,
        phone: input.phone,
      }
    }
  );

  const payload = {
    userId: staff.id,
    role: staff.role,
    tenantId: staff.tenantId,
    restaurantId: input.restaurantId,
  }
    const accessToken = JwtUtils.generateAccessToken(payload);
    const refreshToken = JwtUtils.generateRefreshToken(payload);

    const { password, ...staffWithoutPassword } = staff;
    return {
      user: staffWithoutPassword,
      accessToken,
      refreshToken
    };
  }
  async superAdminRegister(input: SuperAdminRegisterInput) {
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR:[
          { email: input.email },
          { phone: input.phone },
        ]
      }
    });

    console.log(existingAdmin, "existingAdmin");
    

    if (existingAdmin) {
      throw new ApiError(400, 'Username already exists');
    }


    const hashedPassword = await hashPassword(input.password);

    const admin = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        role: Role.SUPER_ADMIN,
        phone: input.phone ?? '',
      }
    },
  );

  const payload = {
    userId: admin.id,
    role: admin.role,
    tenantId: admin.tenantId ?? '',
    restaurantId: null
  }

    const accessToken = JwtUtils.generateAccessToken(payload);
    const refreshToken = JwtUtils.generateRefreshToken(payload);

    const { password, ...adminWithoutPassword } = admin;
    return {
      user: adminWithoutPassword,
      accessToken,
      refreshToken
    };
  }
  async adminRegister(input: SuperAdminRegisterInput) {
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR:[
          { email: input.email },
          { phone: input.phone },
        ]
      }
    });

    console.log(existingAdmin, "existingAdmin");
    

    if (existingAdmin) {
      throw new ApiError(400, 'Email already exists');
    }


    const hashedPassword = await hashPassword(input.password);

    const admin = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        role: Role.ADMIN,
        phone: input.phone ?? '',
      }
    },
  );

  const payload = {
    userId: admin.id,
    role: admin.role,
    tenantId: admin.tenantId ?? '',
    restaurantId: null
  }

    const accessToken = JwtUtils.generateAccessToken(payload);
    const refreshToken = JwtUtils.generateRefreshToken(payload);

    const { password, ...adminWithoutPassword } = admin;
    return {
      user: adminWithoutPassword,
      accessToken,
      refreshToken
    };
  }

  async superAdminLogin(input: SuperAdminLoginInput) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: input.email },
          { phone: input.phone },
        ]
      },
      include: {
        restaurantStaff: true,
      }
    });

    console.log(user, "user");
    

    if (!user || user.role !== Role.SUPER_ADMIN) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isPasswordValid = await comparePassword(input.password, user.password!);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const payload = {
      userId: user.id,
      role: user.role,
      tenantId: user.tenantId ?? '',
      restaurantId: user.restaurantStaff[0]?.restaurantId ?? null,
    }

    const accessToken = JwtUtils.generateAccessToken(payload);
    const refreshToken = JwtUtils.generateRefreshToken(payload);

    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    };
  }
  async adminLogin(input: SuperAdminLoginInput) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: input.email },
          { phone: input.phone },
        ]
      },
      include: {
        restaurantStaff: true,
        branchStaff: true,
      }
    });

    console.log(user, "user");
    

    console.log(user?.role, "user.role", Role.ADMIN);

    if (!user || user?.role !== Role.ADMIN) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isPasswordValid = await comparePassword(input.password, user.password!);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const payload = {
      userId: user.id,
      role: user.role,
      tenantId: user.tenantId ?? '',
      restaurantId: user.restaurantStaff[0]?.restaurantId ?? null,
    }

    const accessToken = JwtUtils.generateAccessToken(payload);
    const refreshToken = JwtUtils.generateRefreshToken(payload);

    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken,  
      refreshToken
    };
  }

  // Admin login
async staffLogin(input: StaffLoginInput) {
  if (!input.username || !input.password) {
    throw new ApiError(400, 'Username and password are required');
  }

  const admin = await prisma.user.findUnique({
    where: { 
      username: input.username,
      tenantId: input.tenantId,
    },
    include: {
      restaurantStaff: true,
      branchStaff: true,
    }
  });

  console.log(admin, "admin");
  

  // Check if user exists and is an admin type user
  if (!admin || !['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'STAFF', 'DELIVERY_BOY', 'MODERATOR', 'RIDER'].includes(admin.role)) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check if user is active
  if (!admin.isActive) {
    throw new ApiError(401, 'Account is inactive');
  }

  const isPasswordValid = await comparePassword(input.password, admin.password!);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const payload = {
    userId: admin.id,
    role: admin.role,
    tenantId: admin?.tenantId ?? null,
    restaurantId: admin?.restaurantStaff[0]?.restaurantId ?? null,
  }

  const accessToken = JwtUtils.generateAccessToken(payload);
  const refreshToken = JwtUtils.generateRefreshToken(payload);

  // await prisma.refreshToken.create({
  //   data: {
  //     token: refreshToken,
  //     userId: admin.id,
  //     expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  //   }
  // });

  // Update last login
  await prisma.user.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() }
  });

  const { password, ...adminWithoutPassword } = admin;
  return {
    user: adminWithoutPassword,
    accessToken,
      refreshToken
    };
  } 
}
