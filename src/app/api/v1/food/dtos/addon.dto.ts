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

  export interface AddonGroupInput {
    addonId: string;
    minQuantity: number;
    maxQuantity: number;
    defaultQuantity: number;
    displayOrder: number;
    isRequired: boolean;
    extraPrice: number;
    updatedById?: string;

  }


  export interface CreateAddonGroupInput {
    name: string;
    isRequired: boolean;
    maxSelectionsAllowed: number;
    description?: string;
    createdById?: string;
    updatedById?: string;
    addons: AddonGroupInput[];
  }
  
  export interface UpdateAddonGroupInput {
    name?: string;
    isRequired?: boolean;
    maxSelectionsAllowed?: number;
    description?: string;
    updatedById?: string;
    addons?: AddonGroupInput[];
  }
