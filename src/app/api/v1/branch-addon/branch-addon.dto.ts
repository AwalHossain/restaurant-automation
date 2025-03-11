import { AddonCategory } from "@prisma/client";


// DTO for creating a new Addon
export interface CreateBranchAddonInput {
  name: string;
  tenantId: string;
  branchId: string;
  price: number;
  description?: string;
  imageUrl?: string;
  imageSize?: number;
  preparationTime?: number;
  allergens?: string[];
  nutritionInfo?: Record<string, any>;
  category?: AddonCategory;
  isActive?: boolean;
  isAvailable?: boolean;
  stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  overrideNotes?: string;
  createdById?: string;
  updatedById?: string;
}

// DTO for updating an Addon
export interface UpdateBranchAddonInput extends Partial<CreateBranchAddonInput> {
  id: string;
}

// DTO for creating FoodAddon (connecting Food and Addon)
export interface CreateBranchFoodAddonInput {
  branchFoodId: string;
  tenantId: string;
  addonId?: string;
  branchAddonId?: string;
  name: string;
  description?: string;
  price: number;
  maxSelections?: number;
  isRequired?: boolean;
  displayOrder?: number;
  isActive?: boolean;
  isAvailable?: boolean;
  stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  preparationTime?: number;
  allergens?: string[];
  nutritionInfo?: Record<string, any>;
  imageUrl?: string;
}
// DTO for bulk creating FoodAddons
export interface CreateBulkBranchFoodAddonsInput {
  tenantId: string;
  branchFoodId: string;
  branchId: string;
  addons: Array<CreateBranchFoodAddonInput>;
}

// DTO for updating FoodAddon
export interface UpdateBranchFoodAddonInput {
  tenantId: string;
  branchFoodId: string;
  addonId: string;
  branchAddonId: string;
  name?: string;
  description?: string;
  price?: number;
  maxSelections?: number;
  isRequired?: boolean;
  displayOrder?: number;
  isActive?: boolean;
  isAvailable?: boolean;
  stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  preparationTime?: number;
  allergens?: string[];
  nutritionInfo?: Record<string, any>;
  imageUrl?: string;
}

// DTO for FoodAddon response
export interface BranchFoodAddonResponse {
  id: string;
  branchFoodId: string;
  addonId: string;
  branchAddonId: string;
  name: string;
  description?: string;
  price: number;
  maxSelections: number;
  isRequired: boolean;
  displayOrder: number;
  isActive: boolean;
  isAvailable: boolean;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  preparationTime?: number;
  allergens?: string[];
  nutritionInfo?: Record<string, any>;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
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
