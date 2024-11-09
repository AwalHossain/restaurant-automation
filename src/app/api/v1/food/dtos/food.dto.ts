import { ImageSpecs } from "../../../../../types/food.types";



export type CreateFoodInput = {
  name: string;
  description: string;
  basePrice: number;
  images: ImageSpecs[];
  createdBy: string;
  updatedBy: string;
  minOrderQuantity: number;
}


// ... existing CreateFoodInput ...

export type UpdateFoodDetailsInput = {
  id: string;
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
  foodVariantIds?: string[];
}

