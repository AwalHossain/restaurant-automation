import { Role } from "@prisma/client";
import ApiError from "../../../../../errors/ApiError";
import { JwtUtils } from "../../../../../helpers/jwt.helper";
import { comparePassword, hashPassword } from "../../../../../helpers/password.helper";
import { prisma } from "../../../../../shared/prisma";


interface RegisterAdminInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface LoginAdminInput {
  phone: string;
  password: string;
}

export class AdminAuthService {
  async register(input: RegisterAdminInput) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: input.email },
          { phone: input.phone }
        ]
      }
    });
    console.log('existingUser', existingUser);
    

    if (existingUser) {
      throw new ApiError(400, 'Email or phone already exists');
    }

    const hashedPassword = await hashPassword(input.password);
    console.log('hashedPassword', hashedPassword);
    

    const user = await prisma.user.create({
      data: {
        ...input,
        password: hashedPassword,
        role: Role.ADMIN,
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

  async login(input: LoginAdminInput) {
    const user = await prisma.user.findUnique({
      where: { phone: input.phone }
    });

    if (!user || user.role !== Role.ADMIN) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isPasswordValid = await comparePassword(input.password, user.password);
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
} 
