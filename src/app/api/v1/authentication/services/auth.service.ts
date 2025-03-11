import { Prisma, Role } from "@prisma/client";
import ApiError from "../../../../../errors/ApiError";
import { JwtUtils } from "../../../../../helpers/jwt.helper";
import { generateOTP } from "../../../../../helpers/otp.helper";
import { comparePassword, hashPassword } from "../../../../../helpers/password.helper";
import { prisma } from "../../../../../shared/prisma";
import { ActiveSession, BranchStaffRecord, LastSelectedRole, LoginUserInput, RegisterUserInput, RestaurantStaffRecord, StaffRecord, StaffRegisterInput, SuperAdminRegisterInput, UnifiedLoginInput, UserWithRoles } from "../dtos/auth.dto";




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
    console.log('Input received:', input); // Debug log

    const { identifier, type, tenantId, branchId } = input;
    
    // Build where conditions based on identifier type
    const whereConditions: Prisma.UserWhereInput = {
      AND: [
        {
          OR: [
            type === 'EMAIL' ? { email: identifier } :
            type === 'PHONE' ? { phone: identifier } :
            { username: identifier }
          ]
        },
        // Add tenantId condition if provided
        ...(tenantId ? [{ tenantId }] : [])
      ]
    };

    const existingStaff = await prisma.user.findFirst({
      where: whereConditions
    });

    if (existingStaff) {
      throw new ApiError(400, 'Username already exists');
    }

    // 

    const hashedPassword = await hashPassword(input.password);


    const createStaff = await prisma.$transaction(async (tx) => {
      // create base user 
      const staff = await tx.user.create({
        data: {
          ...(input.type === 'EMAIL' ? { email: input.identifier } :
          input.type === 'PHONE' ? { phone: input.identifier } :
          { username: input.identifier }),
          tenantId: input.tenantId,
          role: Role.STAFF,
          password: hashedPassword,
        }
      });

      console.log('Staff created:', staff); // Debug log
      console.log('Branch ID:', input.branchId); // Debug log


      // TODO: check if the role goes to the branch or restaurant

      if (input.branchId) {
        console.log('Creating branch staff'); // Debug log
        await tx.branchStaff.create({
          data: {
            userId: staff.id,
            branchId: input.branchId,
            tenantId: input.tenantId,
            roleId: input.roleId,
          }
        });
      } else {
        console.log('Creating restaurant staff'); // Debug log
        await tx.restaurantStaff.create({
          data: {
            userId: staff.id,
            tenantId: input.tenantId,
            roleId: input.roleId,
            restaurantId: input.restaurantId,
          }
        });
      }

      return staff;

    })

    return createStaff;

  }


  // Admin registration
  async adminRegister(input: SuperAdminRegisterInput) {
    const whereConditions = {
      OR: [
        { email: input.email }
      ] as {email?: string, phone?: string}[]
    }

    if (input.phone) {
      whereConditions.OR.push({ phone: input.phone });
    }

    const existingAdmin = await prisma.user.findFirst({
      where: whereConditions
    });

    console.log(existingAdmin, "existingAdmin");


    if (existingAdmin) {
      throw new ApiError(
        400, 
        `${existingAdmin.email === input.email ? 'Email' : 'Phone number'} already exists`
      );
    }


    const hashedPassword = await hashPassword(input.password);

    const admin = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        role: Role.ADMIN,
        ...(input.phone ? { phone: input.phone } : {})
      }
    });

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
  // async staffLogin(input: StaffLoginInput) {
  //   if (!input.username || !input.password) {
  //     throw new ApiError(400, 'Username and password are required');
  //   }

  //   const admin = await prisma.user.findUnique({
  //     where: {
  //       username: input.username,
  //       tenantId: input.tenantId,
  //     },
  //     include: {
  //       restaurantStaff: true,
  //       branchStaff: true,
  //     }
  //   });

  //   console.log(admin, "admin");


  //   // Check if user exists and is an admin type user
  //   if (!admin || !['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'STAFF', 'DELIVERY_BOY', 'MODERATOR', 'RIDER'].includes(admin.role)) {
  //     throw new ApiError(401, 'Invalid credentials');
  //   }

  //   // Check if user is active
  //   if (!admin.isActive) {
  //     throw new ApiError(401, 'Account is inactive');
  //   }

  //   const isPasswordValid = await comparePassword(input.password, admin.password!);
  //   if (!isPasswordValid) {
  //     throw new ApiError(401, 'Invalid credentials');
  //   }

  //   const payload = {
  //     userId: admin.id,
  //     role: admin.role,
  //     tenantId: admin?.tenantId ?? null,
  //     restaurantId: admin?.restaurantStaff[0]?.restaurantId ?? null,
  //   }

  //   const accessToken = JwtUtils.generateAccessToken(payload);
  //   const refreshToken = JwtUtils.generateRefreshToken(payload);

  //   // await prisma.refreshToken.create({
  //   //   data: {
  //   //     token: refreshToken,
  //   //     userId: admin.id,
  //   //     expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  //   //   }
  //   // });

  //   // Update last login
  //   await prisma.user.update({
  //     where: { id: admin.id },
  //     data: { lastLoginAt: new Date() }
  //   });

  //   const { password, ...adminWithoutPassword } = admin;
  //   return {
  //     user: adminWithoutPassword,
  //     accessToken,
  //     refreshToken
  //   };
  // }

  // Unified login
  async unifiedLogin(input: UnifiedLoginInput) {
    const { identifier, type, tenantId } = input;
    
    // Build where conditions based on identifier type
    const whereConditions: Prisma.UserWhereInput = {
      AND: [
        {
          OR: [
            type === 'EMAIL' ? { email: identifier } :
            type === 'PHONE' ? { phone: identifier } :
            { username: identifier }
          ]
        },
        // Add tenantId condition if provided
        ...(tenantId ? [{ tenantId }] : [])
      ]
    };
    // 1. Find user - handle both tenant and system admin cases
    let user = await prisma.user.findFirst({
      where: whereConditions,
      include: {
        restaurantStaff: {
          include: {
            role: true,
            restaurant: {
              include: {
                branches: true
              }
            }
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
        userLoginSession: true,
        
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
    const lastSelectedRole = user?.userLoginSession[0]?.lastSelectedRole;
    const lastSession = await prisma.userLoginSession.findFirst({
      where: {
        userId: user.id,
        tenantId: user.tenantId ?? '',
      }
    })
    let restaurantId = user.restaurantStaff[0]?.restaurantId ? user.restaurantStaff[0]?.restaurantId : user.branchStaff[0]?.branch?.restaurantId

    
    // token
    const payload = {
      userId: user.id,
      role: user.role,
      tenantId: user.tenantId ?? '',
      restaurantId: restaurantId
    }

    const accessToken = JwtUtils.generateAccessToken(payload);
    const refreshToken = JwtUtils.generateRefreshToken(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        tenantId: user.tenantId,
        restaurantId: user.restaurantStaff[0]?.restaurantId ?? null,
        restaurantStaff: user.restaurantStaff,
        branchStaff: user.branchStaff
      },
      roleGroups,
      lastSelectedRole: lastSelectedRole,
      // lastSession: lastSession,
      accessToken,
      refreshToken
    };


  }

  async getUserContext(userId: string, tenantId: string) {
    let user = await prisma.user.findUnique({
      where: {
        id: userId,
        tenantId: tenantId
      },
      include: {
        restaurantStaff: {
          include: {
            role: true,
            restaurant: {
              include: {
                branches: true
              }
            }
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
        userLoginSession: true,
        
      }
    });

    if (!user || !user.isActive) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const roleGroups = this.groupRolesByRestaurant(user);
    const lastSelectedRole = user.userLoginSession[0].lastSelectedRole;

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        tenantId: user.tenantId,
        restaurantId: user.restaurantStaff[0]?.restaurantId ?? null,
        restaurantStaff: user.restaurantStaff,
        branchStaff: user.branchStaff
      },
      roleGroups: roleGroups,
      lastSelectedRole: lastSelectedRole
    };
  }


  private groupRolesByRestaurant(user: UserWithRoles) {
    // Get restaurant info from either restaurant staff or branch staff
    const restaurantInfo = user.restaurantStaff[0]?.restaurant || user.branchStaff[0]?.branch?.restaurant;
    
    if (!restaurantInfo) {
      throw new ApiError(404, 'Restaurant not found');
    }
  
    const roleGroups = {
      id: restaurantInfo.id,
      name: restaurantInfo.name,
      roles: {
        restaurant: user.restaurantStaff[0] ? {
          id: `RESTAURANT-${user.restaurantStaff[0].id}`,
          roleId: user.restaurantStaff[0].roleId,
          roleName: user.restaurantStaff[0].role?.name ?? ''
        } : undefined,
        branches: user.branchStaff.map(branchStaff => ({
          id: `BRANCH-${branchStaff.id}`,
          branchId: branchStaff.branchId,
          name: branchStaff.branch?.name ?? '',
          roleId: branchStaff.roleId,
          roleName: branchStaff.role?.name ?? ''
        }))
      }
    };
  
    // Remove undefined properties
    // if (!roleGroups.roles.restaurant) {
    //   delete roleGroups.roles.restaurant;
    // }
    // if (roleGroups.roles.branches.length === 0) {
    //   delete roleGroups.roles.branches;
    // }
  
    return roleGroups;
  }
  // select role
  async selectRole(userId: string, tenantId: string, roleOption: string, deviceId: string) {
    const [type, staffId] = roleOption.split('-');

    // get the staff record
    const staffRecord = await this.getStaffRecord(type, staffId);
      
    if (!staffRecord) {
      throw new ApiError(404, 'Invalid role selection');
    }

  // Helper function to get location ID based on type
  const getLocationId = (type: string) => {
    return type === 'RESTAURANT' || type === 'ADMIN_BRANCH'
      ? (staffRecord as { restaurantId: string }).restaurantId
      : (staffRecord as { branchId: string }).branchId;
  };

  // Prepare session data
  const newSession: ActiveSession = {
    deviceId,
    roleId: staffRecord.roleId,
    location: {
      role: staffRecord.role?.name ?? '',
      type: type as 'RESTAURANT' | 'BRANCH' | 'ADMIN_BRANCH',
      id: getLocationId(type),
    },
    lastAccessed: new Date()
  };

  const lastSelectedRole: LastSelectedRole = {
    roleId: staffRecord.roleId,
    location: {
      role: staffRecord.role?.name ?? '',
      type: type as 'RESTAURANT' | 'BRANCH',
      id: getLocationId(type),
    }
  };

    // update the user login session
    await prisma.userLoginSession.upsert({
      where: { 
        userId_tenantId: {
          userId: userId,
          tenantId: tenantId
        }
       },
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
      tenantId: tenantId,
      restaurantId: staffRecord.restaurantId,
      userId,
      ...lastSelectedRole,
      deviceId
    };

    const accessToken = JwtUtils.generateAccessToken(payload);
    const refreshToken = JwtUtils.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      payload
    }

  }

  // Handle role switching
  async switchRole(userId: string, tenantId: string, newRoleOption: string, deviceId: string) {
    
    
    const session = await prisma.userLoginSession.findUnique({
      where: {
        userId_tenantId: {
          userId: userId,
          tenantId: tenantId
        }
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
    return this.selectRole(userId, tenantId, newRoleOption, deviceId);
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
      const staff = await prisma.restaurantStaff.findUnique({
        where: { id: staffId },
        include: {
          role: true,
          restaurant: true
        }
      }) as RestaurantStaffRecord;
      console.log(staff, "staff");
      return staff;
    } else if (type === 'BRANCH') {
      const staff = await prisma.branchStaff.findUnique({
        where: { id: staffId },
        include: {
          role: true,
          branch: {
            include: {
              restaurant: true
            }
          }
        }
      }) as BranchStaffRecord;
      return {
        ...staff,
        restaurantId: staff?.branch.restaurant.id ?? ''
      } as BranchStaffRecord;
    }else if(type === 'ADMIN_BRANCH'){
      const branch = await prisma.restaurantStaff.findUnique({
        where: { id: staffId },
        include: {
          role: true,
          restaurant: true
        }
      }) as RestaurantStaffRecord;
      return branch;
    }
    return null;
  }

}

