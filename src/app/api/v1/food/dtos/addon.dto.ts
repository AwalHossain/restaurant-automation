import { AddonCategory } from "@prisma/client";


// DTO for creating a new Addon
export interface CreateAddonInput {
  name: string;
  tenantId: string;
  price: number;
  description?: string;
  imageUrl?: string;
  imageSize?: number;
  preparationTime?: number;
  allergens?: string[];
  nutritionInfo?: Record<string, any>;
  category?: AddonCategory;
  createdById: string;
  updatedById: string;
}

// DTO for updating an Addon
export interface UpdateAddonInput extends Partial<CreateAddonInput> {
  id: string;
}

// DTO for creating FoodAddon (connecting Food and Addon)
export interface CreateFoodAddonInput {
  addonId: string;
  maxSelections?: number;
  isRequired?: boolean;
  isActive?: boolean;
  displayOrder?: number;
}

// DTO for bulk creating FoodAddons
export interface CreateBulkFoodAddonsInput {
  tenantId: string;
  foodId: string;
  addons: Array<CreateFoodAddonInput>;
}

// DTO for updating FoodAddon
export interface UpdateFoodAddonInput {
  foodId:string;
  addonId:string;
  maxSelections?: number;
  isRequired?: boolean;
  displayOrder?: number;
  isActive?: boolean;
}

// DTO for FoodAddon response
export interface FoodAddonResponse {
  id: string;
  foodId: string;
  addonId: string;
  maxSelections: number;
  isRequired: boolean;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  addon: {
    id: string;
    name: string;
    price: number;
    description?: string;
    imageUrl?: string;
    category?: AddonCategory;
    isActive: boolean;
  };
}

// export interface UpdateAddonGroupInput {
//   name?: string;
//   isRequired?: boolean;
//   maxSelectionsAllowed?: number;
//   description?: string;
//   updatedById?: string;
//   addons?: AddonGroupInput[];
// }

// export interface AddonGroupToFoodInput {
//   isRequired: boolean;
//   maxSelectionsAllowed: number;
//   addonGroupId: string;
// }
