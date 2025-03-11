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
        isActive: input.isActive,
        createdById: input.createdById as string,
        updatedById: input.updatedById as string
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
           branchId:branchId,
           branchFoodId:branchFoodId,
           branchAddonId:addon.branchAddonId as string,
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

  async getAllBranchFoodAddons(tenantId:string, branchId:string) {
    const foodAddons = await prisma.branchFoodAddon.findMany({
      where:{
        tenantId:tenantId,
        branchId:branchId
      },
      include:{
        addon:true,
        branchFood:true
      }


    });
    console.log(foodAddons, "all food addons");
    
    return foodAddons;
  }

  async getActiveBranchAddOns(tenantId:string, branchId:string) {
    const addons = await prisma.branchAddon.findMany({
      where:{
        isActive:true,
        tenantId:tenantId,
        branchId:branchId
      }
    });

    if(!addons) throw new ApiError(404, "No active addons found");

    return addons;

  }
  
  async getActiveBranchFoodAddons(tenantId:string, branchId:string) {
    const foodAddons = await prisma.branchFoodAddon.findMany({
      where:{
        isActive:true,
        tenantId:tenantId,
        branchId:branchId
      }
    });
    return foodAddons;
  }


  async updateBranchAddOn( input: UpdateBranchAddonInput,tenantId:string, branchId:string) {
    const {id} = input;
    await this.branchAddonValidationService.validateUpdateBranchAddonInput(input);


    const addon = await prisma.branchAddon.update({
      where: { id,
        isActive:true,
        tenantId:tenantId,
        branchId:branchId
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
  async toggleBranchAddOnActiveStatus(id: string,tenantId:string, branchId:string) {

    // check the addon first 
    const addon = await prisma.branchAddon.findUnique({
      where: { 
        id,
        tenantId:tenantId,
        branchId:branchId
       }
    });

    if(!addon) throw new ApiError(404, "Addon not found");

    const updatedAddon = await prisma.branchAddon.update({
      where: { 
        id,
        tenantId:tenantId,
        branchId:branchId

       },
      data: { isActive:{
        set: !addon.isActive
      } }
    });
    return updatedAddon;
  }

  // delete add on
  async deleteBranchFoodAddon(foodAddonId:string,tenantId:string, branchId:string){
    const foodAddon = await prisma.branchFoodAddon.delete({
      where: {
        id:foodAddonId,
        tenantId,
        branchId
      }
    });
    console.log(foodAddon, "foodAddon");
    return foodAddon;
  }


  // update food addon
  async updateBranchFoodAddon(input:UpdateBranchFoodAddonInput, foodAddonId:string, tenantId:string, branchId:string){


    const foodAddon = await prisma.branchFoodAddon.update({
      where: {
        id:foodAddonId,
        tenantId,
        branchId

      },


      data: input


    });

    return foodAddon;
  }

  // get food addons
  async getBranchFoodAddons(branchFoodId:string,tenantId:string, branchId:string){
    const foodAddons = await prisma.branchFoodAddon.findMany({
      where: { 
        branchFoodId,
        tenantId:tenantId,
        branchId:branchId
       },
       include:{
        branchAddon:{
          select:{
            name:true,
            price:true,
            description:true,
            category:true,
            imageUrl:true,
          }
        }
       },

       orderBy:{
        displayOrder: "asc"
       }
    });
    return foodAddons;
  }

  async toogleBranchFoodAddonActiveStatus(foodAddonId:string,tenantId:string, branchId:string){
    const foodAddon = await prisma.branchFoodAddon.findUnique({
      where: {
        id:foodAddonId,

        tenantId,
        branchId
      }

    });

    if(!foodAddon) throw new ApiError(404, "Food addon not found");

    const updatedFoodAddon = await prisma.branchFoodAddon.update({
      where:{
        id:foodAddonId,
        tenantId,
        branchId

        },
      data:{isActive:{set:!foodAddon.isActive}}
    });


    return updatedFoodAddon;
  }


}
