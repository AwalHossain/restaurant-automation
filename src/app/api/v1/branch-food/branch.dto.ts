import { FoodStatus, StockStatus } from "@prisma/client";
import { ImageSpecs } from "../../../../types/food.types";



// export type CreateFoodInput = {

// }


// ... existing CreateFoodInput ...

export type CreateBranchFoodInput = {
    id?: string;
    tenantId: string;
    branchId: string;  // Required for branch food
    foodId?: string;    // Reference to original food
    name: string;
    description: string;
    basePrice: number;
    allowCustomization?: boolean;
    baseRecipe?: string[];
    status: FoodStatus;
    userId: string;
    images: ImageSpecs[];
    createdBy: string;
    minOrderQuantity: number;
    isPopular?: boolean;
    isRecommended?: boolean;
    isNewArrival?: boolean;
    freeDelivery?: boolean;
    specialDeliveryFee?: boolean;
    haveDiscount?: boolean;
    discountedPrice?: number;
    offer?: string;
    topSnacks?: boolean;
    dynamicHome?: boolean;
    trending?: boolean;
    isFree?: boolean;
    isFeatured?: boolean;
    expiryDate?: Date;
    availableStartTime?: string;
    availableEndTime?: string;
    trendingStartTime?: string;
    trendingEndTime?: string;
    categoryIds?: string[];
    updatedBy: string;
    variants?: CreateBranchFoodVariantInput[];
    foodAddons?: CreateBranchFoodAddonInput[];
    isVariantRequired?: boolean;
    createdById: string;
    isAvailable?: boolean;         // New field specific to branch food
    stockStatus?: StockStatus;     // New field specific to branch food
    preparationTime?: number;      // New field specific to branch food
  }


export type CreateBranchFoodVariantInput = {
  name: string;
  basePrice: number;
  isActive: boolean;
  isRequired?: boolean;
}



export interface CreateBranchFoodAddonInput {
  addonId: string;
  isRequired?: boolean;
  maxQuantity?: number;
  minQuantity?: number;      // New field
  defaultQuantity?: number;  // New field
  displayOrder?: number;     // New field
}

export interface CreateBranchFoodAddon {
  id?: string;
  name: string;
  isRequired: boolean;
  maxSelectionsAllowed: number;  // Changed from previous version
  addons: CreateBranchFoodAddonInput[];
}


