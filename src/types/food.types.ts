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
