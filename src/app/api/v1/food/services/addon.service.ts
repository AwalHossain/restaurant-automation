import { prisma } from "../../../../../shared/prisma";
import { CreateAddonGroupInput, CreateAddonInput, UpdateAddonGroupInput, UpdateAddonInput } from "../dtos/addon.dto";
import { AddOnValidationService } from "../validation/addon-validation.service";


export class AddOnService {
  private readonly addOnValidationService: AddOnValidationService

  constructor () {
    this.addOnValidationService = new AddOnValidationService();
  }

  async createAddOn(input: CreateAddonInput, userId: string) {
    input.createdById = userId;
    input.updatedById = userId;
    await this.addOnValidationService.validateCreateAddonInput(input);

    const addon = await prisma.addon.create({
      data: {
        name: input.name,
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
            id: userId
          }
        },
        updatedBy: {
          connect: {
            id: userId
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
    })

    return addon;
  }


  async createAddOnGroup(input: CreateAddonGroupInput, userId: string) {
    input.createdById = userId;
    input.updatedById = userId;

    const addonGroup = await prisma.addonGroup.create({
      data: {
        name: input.name,
        isRequired: input.isRequired,
        maxSelectionsAllowed: input.maxSelectionsAllowed,
        description: input.description,
        createdBy: {
          connect: {
            id: userId
          }
        },
        addons:{
          create: input.addons.map((addon) => ({
            addon:{
              connect:{
                id: addon.addonId
              }
            },
            minQuantity: addon.minQuantity,
            maxQuantity: addon.maxQuantity,
            isRequired: addon.isRequired,
            extraPrice: addon.extraPrice,
            displayOrder: addon.displayOrder,
          }))
        },
        updatedBy: {
          connect: {
            id: userId
          }
        },
      },
      include:{
        addons:{
          include:{
            addon: true
          }
        },
        _count: true
      }
    });
    return addonGroup;
  }


  async getAddOns() {
    const addons = await prisma.addon.findMany();
    return addons;
  }

  async getAddonGroups() {
    const addonGroups = await prisma.addonGroup.findMany({
      include: {
        addons: {
          include: {
            addon: true
          }
        }
      }
    });
    return addonGroups;
  }

  async getAddOnById(id: string) {
    const addon = await prisma.addon.findUnique({
      where: { id }
    });
    return addon;
  }


  async updateAddOn(id: string, input: UpdateAddonInput ) {
    await this.addOnValidationService.validateUpdateAddonInput(input);
    const addon = await prisma.addon.update({
      where: { id },
      data: input
    });
    return addon;
  }

  async getAddonGroupById(id: string) {
    const addonGroup = await prisma.addonGroup.findUnique({
      where: { id }
    });
    return addonGroup;
  }

  async updateAddonGroup(id: string, input: UpdateAddonGroupInput) {

    const addonGroup = await prisma.addonGroup.update({
      where: { id },
      data:{
        name: input.name,
        isRequired: input.isRequired,
        maxSelectionsAllowed: input.maxSelectionsAllowed,
        description: input.description,
      }
    });
    return addonGroup;
  }

  async deleteAddonGroup(id: string) {
    await prisma.addonToGroup.deleteMany({
      where: { groupId: id },
    });
    
    const addonGroup = await prisma.addonGroup.delete({
      where: { id },
    });
    return addonGroup;
  }

}
