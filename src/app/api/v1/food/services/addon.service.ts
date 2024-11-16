import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../../../../shared/prisma";
import { CreateAddonInput, UpdateAddonInput } from "../dtos/addon.dto";
import { AddOnValidationService } from "../validation/addon-validation.service";


export class AddOnService {
  private readonly addOnValidationService: AddOnValidationService

  constructor () {
    this.addOnValidationService = new AddOnValidationService();
  }

  async createAddOn(input: CreateAddonInput, user: JwtPayload | null) {
    console.log(user, 'user');
    
    const { userId: createdById } = user || {};
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
        createdBy: true,
        updatedBy: true
      }
    })

    return addon;
  }


  async getAddOns() {
    const addons = await prisma.addon.findMany();
    return addons;
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
