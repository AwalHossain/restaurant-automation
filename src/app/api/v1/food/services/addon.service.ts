import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../../../../shared/prisma";
import { CreateAddonGroupInput, CreateAddonInput, UpdateAddonInput } from "../dtos/addon.dto";
import { AddOnValidationService } from "../validation/addon-validation.service";


export class AddOnService {
  private readonly addOnValidationService: AddOnValidationService

  constructor () {
    this.addOnValidationService = new AddOnValidationService();
  }

  async createAddOn(input: CreateAddonInput, user: JwtPayload | null) {
    console.log(user, 'user');
    
    const { userId: createdById } = user || {};
    input.createdById = createdById || '';
    input.updatedById = createdById || '';
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
            id: createdById
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
    })

    return addon;
  }


  async createAddOnGroup(input: CreateAddonGroupInput, user: JwtPayload | null) {
    const { userId: createdById } = user || {};
    input.createdById = createdById || '';
    input.updatedById = createdById || '';

    const addonGroup = await prisma.addonGroup.create({
      data: {
        name: input.name,
        isRequired: input.isRequired,
        maxSelectionsAllowed: input.maxSelectionsAllowed,
        description: input.description,
        createdBy: {
          connect: {
            id: createdById
          }
        },
        updatedBy: {
          connect: {
            id: createdById
          }
        },
        foodAddons: {
          create: input.addons.map((addon) => ({
            addonId: addon.addonId,
            minQuantity: addon.minQuantity,
            maxQuantity: addon.maxQuantity,
            defaultQuantity: addon.defaultQuantity,
            displayOrder: addon.displayOrder,
            addon: {
              connect: {
                id: addon.addonId
              }
            },
          }))
        }
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
        foodAddons: {
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

}
