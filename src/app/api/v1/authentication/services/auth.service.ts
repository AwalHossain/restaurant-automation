import { Prisma, Role } from "@prisma/client";
import ApiError from "../../../../../errors/ApiError";
import { JwtUtils } from "../../../../../helpers/jwt.helper";
import { generateOTP } from "../../../../../helpers/otp.helper";
import { comparePassword, hashPassword } from "../../../../../helpers/password.helper";
import { prisma } from "../../../../../shared/prisma";
import { ActiveSession, LastSelectedRole, LoginUserInput, RegisterUserInput, RestaurantStaffRecord, RoleGroup, StaffLoginInput, StaffRecord, StaffRegisterInput, SuperAdminLoginInput, SuperAdminRegisterInput, UnifiedLoginInput, UserWithRoles } from "../dtos/auth.dto";




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
      where: {
        phone: phone,
        expiresAt: {
          gt: new Date(Date.now() - 5 * 60 * 1000)
        },
      }
    })

    if (recentOtp >= 3) {
      throw new ApiError(400, 'Too many OTP requests, please try after 5 minutes');
    }

    // invalidate any existing OTP
    const invalidated = await prisma.oTP.updateMany({
      where: {
        phone: phone,
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
    if (otp) {
      await prisma.oTP.create({
        data: {
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

  // Staff registration
  async staffRegister(input: StaffRegisterInput) {
    const existingStaff = await prisma.user.findUnique({
      where: { username: input.username }
    });

    if (existingStaff) {
      throw new ApiError(400, 'Username already exists');
    }

    const hashedPassword = await hashPassword(input.password);


    const createStaff = await prisma.$transaction(async (tx) => {
      // create base user 
      const staff = await tx.user.create({
        data: {
          username: input.username,
          tenantId: input.tenantId,
          password: hashedPassword,
        }
      })

      // Assign role based on the scope
      if (input.branchId) {
        await tx.branchStaff.create({
          data: {
            userId: staff.id,
            branchId: input.branchId,
            tenantId: input.tenantId,
            roleId: input.roleId,
          }
        })
      } else {
        await tx.restaurantStaff.create({
          data: {
            userId: staff.id,
            tenantId: input.tenantId,
            roleId: input.roleId,
          }
        })
      }

      return staff;

    })

    return createStaff;

  }


  // Admin registration
  async adminRegister(input: SuperAdminRegisterInput) {
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
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


  // Admin login
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

  // Unified login
  async unifiedLogin(input: UnifiedLoginInput) {
    // 1. Find user - handle both tenant and system admin cases
    let user = await prisma.user.findFirst({
      where: {
        AND: [
          {
            OR: [
              { email: input.identifier },
              { username: input.identifier }
            ]
          },
          input.tenantId ? { tenantId: input.tenantId } : {}
        ]
      },
      include: {
        restaurantStaff: {
          include: {
            role: true,
            restaurant: true
          }
        },
        branchStaff: {
          include: {
            role: true,
            branch: {
              include: {
                restaurant: true
              }
            }
          }
        },
        userLoginSession: true
      }
    });

    if (!user || !user.isActive) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // 2. Verify password
    const isPasswordValid = await comparePassword(input.password, user.password!);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // 3. Group roles by restaurant
    const roleGroups = this.groupRolesByRestaurant(user);

    // 4. Get last selected role
    const lastSession = user.userLoginSession?.map((session) => session.lastSelectedRole);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      roleGroups,
      lastSelectedRole: lastSession,
    };
  }


  private groupRolesByRestaurant(user: UserWithRoles) {
    const groupedRoles = new Map<string, RoleGroup>();

    // Group roles by restaurant
    user.restaurantStaff.forEach((staff) => {

      if (!groupedRoles.has(staff?.restaurantId!)) {
        groupedRoles.set(staff?.restaurantId!, {
          restaurantId: staff?.restaurantId!,
          restaurantName: staff?.restaurant?.name ?? '',
          roles: {
            restaurantRoles: [],
            branchRoles: []
          }
        })
      }

      groupedRoles.get(staff?.restaurantId!)?.roles.restaurantRoles.push({
        id: `restaurant-${staff?.id}`,
        type: 'RESTAURANT',
        roleId: staff?.roleId,
        roleName: staff?.role?.name ?? '',
        locationId: staff?.restaurantId ?? '',
      });
    })

    // Group roles by branch
    user.branchStaff.forEach((staff) => {
      const restaurantId = staff?.branch?.restaurantId;
      if (!groupedRoles.has(restaurantId!)) {
        groupedRoles.set(restaurantId!, {
          restaurantId: restaurantId!,
          restaurantName: staff?.branch?.restaurant?.name ?? '',
          roles: {
            restaurantRoles: [],
            branchRoles: []
          }
        })
      }

      groupedRoles.get(restaurantId!)?.roles.branchRoles.push({
        id: `branch-${staff?.id}`,
        type: 'BRANCH',
        roleId: staff?.roleId,
        roleName: staff?.role?.name ?? '',
        locationId: staff?.branchId ?? '',
      });

    })


    // return grouped roles
    return Array.from(groupedRoles.values());

  }


  // select role
  async selectRole(userId: string, tenantId: string, roleOption: string, deviceId: string) {
    const [type, staffId] = roleOption.split('-');

    // get the staff record
    const staffRecord = await this.getStaffRecord(type, staffId);

    if (!staffRecord) {
      throw new ApiError(404, 'Invalid role selection');
    }

    // Prepare session data
    const newSession: ActiveSession = {
      deviceId,
      roleId: staffRecord.roleId,
      type: type as 'RESTAURANT' | 'BRANCH',
      locationId: type === 'RESTAURANT'
        ? (staffRecord as { restaurantId: string }).restaurantId
        : (staffRecord as { branchId: string }).branchId,
      lastAccessed: new Date()
    }

    const lastSelectedRole: LastSelectedRole = {
      roleId: staffRecord.roleId,
      type: type as 'RESTAURANT' | 'BRANCH',
      locationId: type === 'RESTAURANT'
        ? (staffRecord as { restaurantId: string }).restaurantId
        : (staffRecord as { branchId: string }).branchId,
    }

    // update the user login session
    await prisma.userLoginSession.upsert({
      where: { id: userId },
      update: {
        lastSelectedRole: lastSelectedRole as unknown as Prisma.InputJsonValue,
        activeSessions: {
          push: newSession as unknown as Prisma.InputJsonValue
        }
      },
      create: {
        userId: userId,
        tenantId: tenantId,
        lastSelectedRole: lastSelectedRole as unknown as Prisma.InputJsonValue,
        activeSessions: [newSession as unknown as Prisma.InputJsonValue]
      }
    })

    // Generate tokens
    const payload = {
      userId,
      ...lastSelectedRole,
      deviceId
    };

    const accessToken = JwtUtils.generateAccessToken(payload);
    const refreshToken = JwtUtils.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken
    }

  }

  // Handle role switching
  async switchRole(id: string, tenantId: string, newRoleOption: string, deviceId: string) {
    const session = await prisma.userLoginSession.findUnique({
      where: {
        id: id,
        tenantId: tenantId
      }
    })

    if (!session) {
      throw new ApiError(404, 'Session not found');
    }

    const activeSessions = session.activeSessions as unknown as ActiveSession[];

    const currentSessionIndex = activeSessions.findIndex((session) => session.deviceId === deviceId);

    if (currentSessionIndex === -1) {
      throw new ApiError(404, 'Current session not found');
    }

    // generate new session
    return this.selectRole(id, tenantId, newRoleOption, deviceId);
}


// clean up expired sessions
  // Clean up expired sessions
  async cleanupSessions(userId: string) {
    const session = await prisma.userLoginSession.findUnique({
      where: { id: userId }
    });

    if (session) {
      const activeSessions = session.activeSessions as unknown as ActiveSession[];
      const validSessions = activeSessions.filter(s => 
        new Date(s.lastAccessed).getTime() > Date.now() - (24 * 60 * 60 * 1000) // 24 hours
      );

      await prisma.userLoginSession.update({
        where: { id: userId },
        data: {
          activeSessions: validSessions as unknown as Prisma.InputJsonValue[] 
        }
      });
    }
  }

  private async getStaffRecord(type: string, staffId: string): Promise<StaffRecord> {
    if (type === 'RESTAURANT') {
      return await prisma.restaurantStaff.findUnique({
        where: { id: staffId },
        include: {
          role: true,
          restaurant: true
        }
      }) as RestaurantStaffRecord;
    } else if (type === 'BRANCH') {
      return await prisma.branchStaff.findUnique({
        where: { id: staffId },
        include: {
          role: true,
          branch: true
        }
      })
    }
    return null;
  }

}

