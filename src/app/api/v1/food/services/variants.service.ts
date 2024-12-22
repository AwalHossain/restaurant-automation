import httpStatus from "http-status";
import ApiError from "../../../../../errors/ApiError";
import { prisma } from "../../../../../shared/prisma";
import { CreateVariantInput, UpdateVariantInput } from "../dtos/variants.dto";
import { VariantValidationService } from "../validation/variant-validation.service";

export class VariantService {
  constructor(private readonly validationService: VariantValidationService) {
    this.validationService = validationService;
  }

  async createBulkVariants(foodId: string, variants: Array<Omit<CreateVariantInput, "foodId">>) {
    // validate all variants first
    const variantsWithFoodId = variants.map(variant => ({
      ...variant,
      foodId
    }));

    // validate all variants
    await Promise.all(variantsWithFoodId.map(variant => this.validationService.validateCreateVariant(variant)));

    // create all variants in transaction
    const createdVariants = await prisma.$transaction(async tx => {
      const created = await Promise.all(
        variants.map(variant =>
          tx.foodVariant.create({
            data: {
              name: variant.name,
              basePrice: variant.basePrice,
              isActive: variant.isActive ?? true,
              isRequired: variant.isRequired ?? false,
              foodId
            }
          })
        )
      );

      // Create price history entries
      await Promise.all(
        created.map(variant =>
          tx.priceHistory.create({
            data: {
              oldPrice: variant.basePrice,
              newPrice: variant.basePrice,
              variantId: variant.id,
              changedById: "system"
            }
          })
        )
      );

      return created;
    });

    return createdVariants;
  }

  async updateVariant(foodId: string, variants: Array<UpdateVariantInput>) {
    // validate food exist
    const food = await prisma.food.findUnique({
      where: {
        id: foodId
      }
    });

    

    if (!food) throw new ApiError(httpStatus.NOT_FOUND, "Food not found");

    console.log(variants, "variants");
    // validate all variants
    await Promise.all(variants.map(variant => this.validationService.validateUpdateVariant({ ...variant, foodId })));

    // update all variants in transaction
    const updatedVariants = await prisma.$transaction(async tx => {
      const updates = await Promise.all(
        variants.map(async variant => {
          const currentVariant = await tx.foodVariant.findUnique({
            where: { id: variant.id }
          });

          const updated = await tx.foodVariant.update({
            where: { id: variant.id },
            data: variant
          });
          // create price history for all variants if price changed
          if (variant.basePrice && Number(variant.basePrice) !== Number(currentVariant?.basePrice)) {
            await tx.priceHistory.create({
              data: {
                oldPrice: currentVariant?.basePrice || 0,
                newPrice: variant.basePrice,
                variantId: variant.id,
                changedById: "system"
              }
            });
          }
          return updated;
        })
      );

      return updates;
    });

    return updatedVariants;
  }

  //   add a new variant

  async addNewVariant(foodId: string, variants: Array<Omit<CreateVariantInput, "foodId">>) {
    // validate food exist
    const food = await prisma.food.findUnique({
      where: {
        id: foodId
      },
      include: {
        variants: true
      }
    });

    if (!food) throw new ApiError(httpStatus.NOT_FOUND, "Food not found");

    // add foodId to variants
    const variantsWithFoodId = variants.map(variant => ({
      ...variant,
      foodId
    }));

    // validate all new variants
    await Promise.all(variantsWithFoodId.map(variant => this.validationService.validateCreateVariant(variant)));

    // create all new variants in transaction
    const createdVariants = await prisma.$transaction(async tx => {
      const created = await Promise.all(
        variants.map(variant =>
          tx.foodVariant.create({
            data: {
              name: variant.name,
              basePrice: variant.basePrice,
              isActive: variant.isActive ?? true,
              isRequired: variant.isRequired ?? false,
              foodId
            }
          })
        )
      );

      // create initial price history for all variants
      await Promise.all(
        created.map(variant =>
          tx.priceHistory.create({
            data: {
              oldPrice: variant.basePrice,
              newPrice: variant.basePrice,
              variantId: variant.id,
              changedById: "system",
              foodId
            }
          })
        )
      );

      return created;
    });

    return createdVariants;
  }

  async deleteVariant(id: string) {
    return prisma.foodVariant.update({
      where: { id },
      data: { isActive: false }
    });
  }

  async getVariantsByFoodId(foodId: string) {
    return prisma.foodVariant.findMany({
      where: { foodId },
      include: {
        food: true
      }
    });
  }
}
