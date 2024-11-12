import { Role } from "@prisma/client";
import ApiError from "../../../../../errors/ApiError";
import { JwtUtils } from "../../../../../helpers/jwt.helper";
import { generateOTP } from "../../../../../helpers/otp.helper";
import { comparePassword, hashPassword } from "../../../../../helpers/password.helper";
import { prisma } from "../../../../../shared/prisma";
import { AdminLoginInput, AdminRegisterInput, LoginUserInput, RegisterUserInput } from "../dtos/auth.dto";




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

    // Generate OTP
    const otp = generateOTP(); // Implement this helper function

    // Store OTP in database with expiration
    await prisma.oTP.create({
      data:{
        phone: phone,
        code: otp,
        expiresAt: new Date(Date.now() + 2 * 60 * 1000) // 2 minutes
      }
    })

    // Send OTP via SMS
    // await sendSMS(phoneNumber, `Your OTP is: ${otp}`);

    return otp;
  }

  // Step 2: Verify OTP
  async verifyOTP(phone: string, otp: string) {
    // Implement OTP verification logic here
    // You can use the OTP model to check if the OTP is valid and not expired
    // Return true if OTP is valid, false otherwise
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        phone: phone,
        code: otp,
        expiresAt: {
          gt: new Date()
        },
        used: false
      }
    });

    console.log(otpRecord, "otpRecord");

    if (!otpRecord) {
      throw new ApiError(400, 'Invalid or expired OTP');
    }

    // Mark OTP as used
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { used: true }
    });

    return true;
  }

  // Step 3: Complete user registration
  async completeRegistration(input: RegisterUserInput) {
    const hashedPassword = await hashPassword(input.password!);

    const user = await prisma.user.create({
      data: {
          phone: input.phone,
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

  async login(input: LoginUserInput) {
    const user = await prisma.user.findUnique({
      where: { phone: input.phone }
    });

    if (!user || user.role !== Role.ADMIN) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isPasswordValid = await comparePassword(input.password, user.password!);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const accessToken = JwtUtils.generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = JwtUtils.generateRefreshToken({ userId: user.id, role: user.role });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    };
  }

  // Admin registration
  async adminRegister(input: AdminRegisterInput) {
    const existingAdmin = await prisma.user.findUnique({
      where: { username: input.username }
    });

    console.log(existingAdmin, "existingAdmin");
    

    if (existingAdmin) {
      throw new ApiError(400, 'Username already exists');
    }

    const hashedPassword = await hashPassword(input.password);

    const admin = await prisma.user.create({
      data: {
        username: input.username,
        password: hashedPassword,
        role: input.role,
        phone: input.phone,
      }
    });

    const accessToken = JwtUtils.generateAccessToken({ userId: admin.id, role: admin.role });
    const refreshToken = JwtUtils.generateRefreshToken({ userId: admin.id, role: admin.role });

    const { password, ...adminWithoutPassword } = admin;
    return {
      user: adminWithoutPassword,
      accessToken,
      refreshToken
    };
  }

  // Admin login
async adminLogin(input: AdminLoginInput) {
  if (!input.username || !input.password) {
    throw new ApiError(400, 'Username and password are required');
  }

  const admin = await prisma.user.findUnique({
    where: { 
      username: input.username,
    }
  });

  console.log(admin, "admin");
  

  // Check if user exists and is an admin type user
  if (!admin || !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(admin.role)) {
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

  const accessToken = JwtUtils.generateAccessToken({ userId: admin.id, role: admin.role });
  const refreshToken = JwtUtils.generateRefreshToken({ userId: admin.id, role: admin.role });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: admin.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

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
