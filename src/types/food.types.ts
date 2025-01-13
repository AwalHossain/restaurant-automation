import { DeviceType } from "@prisma/client";


// types/food.types.ts
export interface CreateFoodDTO {
    name: string;
    description?: string;
    basePrice: number;
    minOrderQuantity?: number;
    images: {
      mobile: Express.Multer.File;
      tablet?: Express.Multer.File;
      desktop?: Express.Multer.File;
    };
  }
  
export interface FoodImageSpecs {
  MOBILE: { width: 640, height: 360 },
  TABLET: { width: 1024, height: 576 },
  DESKTOP: { width: 1920, height: 1080 }
  }


  export type ImageSpecs = {
    width: number;
    height: number;
    url: string;
    size: number;
    deviceType: DeviceType;
  }

export interface AddonImageSpecs {
  imageUrl: string;
  imageSize: number;
}


export const userSelect = {
  select: {    // Wrap fields in a select object
    id: true,
    email: true,
    username: true,
    fullName: true,
    firstName: true,
    lastName: true,
    phone: true,
    role: true,
    isActive: true,
    isVerified: true,
    otpAttempts: true,
    lastOtpSentAt: true,
    createdAt: true,
    updatedAt: true,
    image: true,
    isDeleted: true,
    deletedById: true,
    deletedAt: true,
    branchId: true,
    lastLoginAt: true,
    isMfaEnabled: true,
    mfaSecret: true,
  }
} as const;