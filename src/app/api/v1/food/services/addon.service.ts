import { prisma } from "../../../../../shared/prisma";
import { getCurrentUserId } from "../../../../../utils/user-context";
import { CreateAddonGroupInput, CreateAddonInput, UpdateAddonGroupInput, UpdateAddonInput } from "../dtos/addon.dto";
import { AddOnValidationService } from "../validation/addon-validation.service";

export class AddOnService {
  constructor(private readonly addOnValidationService: AddOnValidationService) {
    this.addOnValidationService = addOnValidationService;
  }

  async createAddOn(input: CreateAddonInput) {
    const { userId } = getCurrentUserId();
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
    });

    return addon;
  }

  async createAddOnGroupForFood(
    foodId: string,
    addonGroups: Array<Omit<CreateAddonGroupInput, "foodId">>,
    userId: string
  ) {
    const addonGroupsWithFoodId = addonGroups.map(addonGroup => ({
      ...addonGroup,
      foodId
    }));

    // validate all addon groups
    await Promise.all(
      addonGroupsWithFoodId.map(addonGroup => this.addOnValidationService.validateCreateAddonGroupInput(addonGroup))
    );

    console.log(addonGroupsWithFoodId, "addonGroupsWithFoodId");

    // create all addon groups
    const createdAddonGroups = await prisma.$transaction(async tx => {
      return await Promise.all(
        addonGroups.map(async addonGroup => {
          return await tx.addonGroup.create({
            data: {
              name: addonGroup.name,
              isRequired: addonGroup.isRequired,
              maxSelectionsAllowed: addonGroup.maxSelectionsAllowed,
              description: addonGroup.description,
              // create the addon relation
              addons: {
                create: addonGroup.addons.map(addon => ({
                  addon: {
                    connect: {
                      id: addon.addonId
                    }
                  },
                  minQuantity: addon.minQuantity,
                  maxQuantity: addon.maxQuantity,
                  isRequired: addon.isRequired,
                  extraPrice: addon.extraPrice,
                  displayOrder: addon.displayOrder
                }))
              },
              createdBy: {
                connect: {
                  id: userId
                }
              },
              updatedBy: {
                connect: {
                  id: userId
                }
              },
              // create the relation with food through junction table
              foods: {
                create: {
                  food: {
                    connect: {
                      id: foodId
                    }
                  },
                  isRequired: addonGroup.isRequired,
                  maxSelectionsAllowed: addonGroup.maxSelectionsAllowed
                }
              }
            },
            include: {
              addons: {
                include: {
                  addon: true
                }
              }
            }
          });
        })
      );
    });
    console.log(createdAddonGroups, "createdAddonGroups");
    return createdAddonGroups;
  }

  // helper method to connet existing addoonGroup to food
  async connectAddonGroupToFood(
    foodId: string,
    addonGroupId: string,
    config: { isRequired: boolean; maxSelectionsAllowed: number; updatedById: string }
  ) {
    const foodAddonGroup = await prisma.foodAddonGroup.create({
      data: {
        food: {
          connect: {
            id: foodId
          }
        },
        addonGroup: {
          connect: {
            id: addonGroupId
          }
        },
        isRequired: config.isRequired,
        maxSelectionsAllowed: config.maxSelectionsAllowed
      },
      include: {
        addonGroup: {
          include: {
            addons: {
              include: {
                addon: true
              }
            }
          }
        }
      }
    });
    return foodAddonGroup;
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

  async updateAddOn(id: string, input: UpdateAddonInput) {
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
      data: {
        name: input.name,
        isRequired: input.isRequired,
        maxSelectionsAllowed: input.maxSelectionsAllowed,
        description: input.description
      }
    });
    return addonGroup;
  }

  async deleteAddonGroup(id: string) {
    await prisma.addonToGroup.deleteMany({
      where: { groupId: id }
    });

    const addonGroup = await prisma.addonGroup.delete({
      where: { id }
    });
    return addonGroup;
  }
}
