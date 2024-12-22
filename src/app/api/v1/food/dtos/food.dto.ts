import { ImageSpecs } from "../../../../../types/food.types";



// export type CreateFoodInput = {

// }


// ... existing CreateFoodInput ...

export type CreateFoodInput = {
  id?: string;
  name: string;
  userId: string;
  description: string;
  basePrice: number;
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
  branchIds?: string[];
  campaignId?: string;
  updatedBy: string;
  variants?: CreateFoodVariantInput[];
  foodAddons?: CreateFoodAddonInput[];
  isVariantRequired?: boolean;
  createdById: string;
}


export type CreateFoodVariantInput = {
  name: string;
  basePrice: number;
  isActive: boolean;
  isRequired?: boolean;
}



export interface CreateFoodAddonInput {
  addonId: string;
  isRequired?: boolean;
  maxQuantity?: number;
  minQuantity?: number;      // New field
  defaultQuantity?: number;  // New field
  displayOrder?: number;     // New field
}

export interface CreateFoodAddon {
  id?: string;
  name: string;
  isRequired: boolean;
  maxSelectionsAllowed: number;  // Changed from previous version
  addons: CreateFoodAddonInput[];
}


