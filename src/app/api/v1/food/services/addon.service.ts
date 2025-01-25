import ApiError from "../../../../../errors/ApiError";
import { prisma } from "../../../../../shared/prisma";
import { CreateAddonInput, CreateBulkFoodAddonsInput, CreateFoodAddonInput, UpdateAddonInput, UpdateFoodAddonInput } from "../dtos/addon.dto";
import { AddOnValidationService } from "../validation/addon-validation.service";

export class AddonService {
  private readonly addOnValidationService: AddOnValidationService;
  constructor() {
    this.addOnValidationService = new AddOnValidationService();
  }

  async createAddOn(input: CreateAddonInput) {


    const addon = await prisma.addon.create({
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
        createdBy: {
          connect: {
            id: input.createdById
          }
        },
        updatedBy: {
          connect: {
            id: input.updatedById
          }
        }
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return addon;
  }

  async createBulkFoodAddons(input: CreateBulkFoodAddonsInput) {
    const {foodId, addons, tenantId} = input;
    console.log(addons, "addons", foodId);
    const createdFoodAddons = await prisma.$transaction(async (tx) => {
     const results = await Promise.all(
      addons.map(async (addon:CreateFoodAddonInput) => {
        return tx.foodAddon.createMany({
          data: {
           tenantId: tenantId,
           foodId:foodId,
           addonId:addon.addonId,
           maxSelections: addon.maxSelections,
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


  async getAddOns(tenantId:string) {
    const addons = await prisma.addon.findMany({
      where:{
        tenantId:tenantId
      },
      include:{
        createdBy:true
      }
    });
    return addons;
  }

  async getAllFoodAddons(tenantId:string) {
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

  async getActiveAddOns(tenantId:string) {
    const addons = await prisma.addon.findMany({
      where:{
        isActive:true,
        tenantId:tenantId
      }
    });
    return addons;
  }
  
  async getActiveFoodAddons(tenantId:string) {
    const foodAddons = await prisma.foodAddon.findMany({
      where:{
        isActive:true,
        tenantId:tenantId
      }
    });
    return foodAddons;
  }


  async updateAddOn( input: UpdateAddonInput,tenantId:string) {
    const {id} = input;
    await this.addOnValidationService.validateUpdateAddonInput(input);


    const addon = await prisma.addon.update({
      where: { id,
        isActive:true,
        tenantId:tenantId
       },
      data: input
    });
    return addon;
  }

  async getAddOnById(id: string,tenantId:string ) {
    const addon = await prisma.addon.findUnique({
      where: { id,
        isActive:true,
        tenantId:tenantId
       }
    });
    return addon;
  }

  // toggle add on active status
  async toggleAddOnActiveStatus(id: string,tenantId:string) {

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
  async deleteFoodAddon(foodId:string,addonId:string,tenantId:string){
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
  async updateFoodAddon(input:UpdateFoodAddonInput,tenantId:string){
    const {foodId,addonId} = input;

    const foodAddon = await prisma.foodAddon.update({
      where: {
        foodId_addonId:{
          foodId,
          addonId
        },
        tenantId:tenantId
      },
      data: input
    });
    return foodAddon;
  }

  // get food addons
  async getFoodAddons(foodId:string,tenantId:string){
    const foodAddons = await prisma.foodAddon.findMany({
      where: { 
        foodId,
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

  async toogleFoodAddonActiveStatus(foodId:string,addonId:string,tenantId:string){
    const foodAddon = await prisma.foodAddon.findUnique({
      where:{
        foodId_addonId:{
          foodId,
          addonId
        },
        tenantId:tenantId
      }
    })

    if(!foodAddon) throw new ApiError(404, "Food addon not found");

    const updatedFoodAddon = await prisma.foodAddon.update({
      where:{
        foodId_addonId:{
          foodId,
          addonId
        },
        tenantId:tenantId
      },
      data:{isActive:{set:!foodAddon.isActive}}
    })
    return updatedFoodAddon;
  }


}
