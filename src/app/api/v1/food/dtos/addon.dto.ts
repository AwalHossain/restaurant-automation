import { AddonCategory } from "@prisma/client";

// Input type definitions
export interface CreateAddonInput {
    name: string;
    price: number;
    description?: string;
    category?: AddonCategory;
    imageUrl?: string;
    imageSize?: number;
    preparationTime?: number;
    allergens?: string[];
    nutritionInfo?: Record<string, any>;
    createdById: string;
    updatedById: string;
  }
  
  export interface CreateAddonGroupInput {
    name: string;
    isRequired: boolean;
    maxSelectionsAllowed: number;
    addons: CreateAddonInput[];
  }


  export interface UpdateAddonInput {
    name?: string;
    price?: number;
    description?: string;
    category?: AddonCategory;
    imageUrl?: string;
    imageSize?: number;
    preparationTime?: number;
    allergens?: string[];
    nutritionInfo?: Record<string, any>;
    updatedById: string;
    isActive?: boolean;
    isDeleted?: boolean;
    deletedById?: string;
    deletedAt?: Date;
  }
