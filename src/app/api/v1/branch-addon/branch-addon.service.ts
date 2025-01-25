import ApiError from "../../../../errors/ApiError";
import { prisma } from "../../../../shared/prisma";
import { CreateBranchAddonInput, CreateBranchFoodAddonInput, CreateBulkBranchFoodAddonsInput, UpdateBranchAddonInput, UpdateBranchFoodAddonInput } from "./branch-addon.dto";

import { BranchAddonValidationService } from "./branch-addon.validation";

export class BranchAddonService {
  private readonly branchAddonValidationService: BranchAddonValidationService;
  constructor() {
    this.branchAddonValidationService = new BranchAddonValidationService();
  }

  async createBranchAddOn(input: CreateBranchAddonInput) {


    const addon = await prisma.branchAddon.create({
      data: {
        name: input.name,
        tenantId: input.tenantId,
        price: input.price,
        description: input.description,
        category: input.category,
        imageUrl: input.imageUrl,
        imageSize: input.imageSize,
        preparationTime: input.preparationTime,
        allergens: input.allergens,
        nutritionInfo: input.nutritionInfo,
        branchId: input.branchId,
        isActive: input.isActive
      },
    });

    return addon;
  }

  async createBulkBranchFoodAddons(input: CreateBulkBranchFoodAddonsInput) {
    const {branchFoodId, addons, tenantId, branchId} = input;
    console.log(addons, "addons", branchFoodId);
    const createdFoodAddons = await prisma.$transaction(async (tx) => {
     const results = await Promise.all(
      addons.map(async (addon:CreateBranchFoodAddonInput) => {
        return tx.branchFoodAddon.createMany({
          data: {
           tenantId: tenantId,
           branchFoodId:branchFoodId,
           branchAddonId:addon.branchAddonId,
           // branchAddonId:addon.branchAddonId || "",
           maxSelections: addon.maxSelections || 1,
           isRequired: addon.isRequired || false,
           isActive: addon.isActive || true,
           displayOrder: addon.displayOrder || 0,

          }
        })
      })
     )
     return results;
    })
    return createdFoodAddons;
  }


  async getBranchAddOns(tenantId:string, branchId:string) {
    const addons = await prisma.branchAddon.findMany({
      where:{
        tenantId:tenantId,
        branchId:branchId
      },
      include:{
        // addon:true
      }
    });
    return addons;
  }

  async getAllBranchFoodAddons(tenantId:string) {
    const foodAddons = await prisma.foodAddon.findMany({
      where:{
        tenantId:tenantId
      },
      include:{
        addon:true,
        food:true
      }
    });
    console.log(foodAddons, "all food addons");
    
    return foodAddons;
  }

  async getActiveBranchAddOns(tenantId:string) {
    const addons = await prisma.addon.findMany({
      where:{
        isActive:true,
        tenantId:tenantId
      }
    });
    return addons;
  }
  
  async getActiveBranchFoodAddons(tenantId:string) {
    const foodAddons = await prisma.foodAddon.findMany({
      where:{
        isActive:true,
        tenantId:tenantId
      }
    });
    return foodAddons;
  }


  async updateBranchAddOn( input: UpdateBranchAddonInput,tenantId:string) {
    const {id} = input;
    await this.branchAddonValidationService.validateUpdateBranchAddonInput(input);


    const addon = await prisma.addon.update({
      where: { id,
        isActive:true,
        tenantId:tenantId
       },
      data: input
    });
    return addon;
  }

  async getBranchAddOnById(id: string,tenantId:string, branchId:string ) {
    const addon = await prisma.branchAddon.findUnique({
      where: { id,
        isActive:true,
        tenantId:tenantId,
        branchId:branchId
       }
    });
    return addon;
  }

  // toggle add on active status
  async toggleBranchAddOnActiveStatus(id: string,tenantId:string) {

    // check the addon first 
    const addon = await prisma.addon.findUnique({
      where: { 
        id,
        tenantId:tenantId
       }
    });
    if(!addon) throw new ApiError(404, "Addon not found");

    const updatedAddon = await prisma.addon.update({
      where: { 
        id,
        tenantId:tenantId
       },
      data: { isActive:{
        set: !addon.isActive
      } }
    });
    return updatedAddon;
  }

  // delete add on
  async deleteBranchFoodAddon(foodId:string,addonId:string,tenantId:string){
    const foodAddon = await prisma.foodAddon.delete({
      where: {
       foodId_addonId:{
        foodId,
        addonId
       },
       tenantId:tenantId
      }
    });
    console.log(foodAddon, "foodAddon");
    return foodAddon;
  }

  // update food addon
  async updateBranchFoodAddon(input:UpdateBranchFoodAddonInput,tenantId:string){
    const {branchFoodId,addonId,branchAddonId} = input;

    const foodAddon = await prisma.branchFoodAddon.update({
      where: {
        tenantId_branchFoodId_addonId:{
          tenantId,
          branchFoodId,
          addonId,
          // branchAddonId
        },
      },
      data: input
    });
    return foodAddon;
  }

  // get food addons
  async getBranchFoodAddons(branchFoodId:string,tenantId:string){
    const foodAddons = await prisma.branchFoodAddon.findMany({
      where: { 
        branchFoodId,
        tenantId:tenantId
       },
       include:{
        addon:true
       },
       orderBy:{
        displayOrder: "asc"
       }
    });
    return foodAddons;
  }

  async toogleBranchFoodAddonActiveStatus(branchFoodId:string,addonId:string,tenantId:string, branchAddonId:string){
    const foodAddon = await prisma.branchFoodAddon.findUnique({
      where: {
        tenantId_branchFoodId_addonId: {
          tenantId,
          branchFoodId,
          addonId,
          // branchAddonId
        }
      }
    });

    if(!foodAddon) throw new ApiError(404, "Food addon not found");

    const updatedFoodAddon = await prisma.branchFoodAddon.update({
      where:{
        tenantId_branchFoodId_addonId: {
          tenantId,
          branchFoodId,
          addonId,
          // branchAddonId
        },
      },
      data:{isActive:{set:!foodAddon.isActive}}
    })
    return updatedFoodAddon;
  }


}
