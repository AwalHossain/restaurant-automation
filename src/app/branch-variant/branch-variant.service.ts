import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { prisma } from "../../shared/prisma";
import { CreateVariantInput, UpdateVariantInput } from "../api/v1/food/dtos/variants.dto";
import { BranchVariantValidationService } from "./branch-variant.validation";

export class BranchVariantService {
    private readonly branchVariantValidationService: BranchVariantValidationService;
  constructor() {
    this.branchVariantValidationService = new BranchVariantValidationService();
  }
  async createBulkBranchVariants(foodId: string, tenantId: string, branchId: string, variants: Array<Omit<CreateVariantInput, "foodId">>) {
    // validate all variants first
    const variantsWithFoodId = variants.map(variant => ({
      ...variant,
      foodId
    }));

    // validate all variants
    await Promise.all(variantsWithFoodId.map(variant => this.branchVariantValidationService.validateCreateVariant(variant)));

    // create all variants in transaction
    const createdVariants = await prisma.$transaction(async tx => {
      const created = await Promise.all(
        variants.map(variant =>
          tx.branchFoodVariant.create({
            data: {
              tenantId: tenantId,
              branchId: branchId,
              name: variant.name,
              basePrice: variant.basePrice,
              isActive: variant.isActive ?? true,
              isRequired: variant.isRequired ?? false,
              branchFoodId: foodId
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

  async updateBranchVariant(foodId: string, tenantId: string, branchId: string, variants: Array<UpdateVariantInput>) {
    // validate food exist
    const food = await prisma.branchFood.findFirst({
      where: {
        id: foodId,
        tenantId,
        branchId
      }
    });

    

    if (!food) throw new ApiError(httpStatus.NOT_FOUND, "Food not found");

    console.log(variants, "variants");
    // validate all variants
    await Promise.all(variants.map(variant => this.branchVariantValidationService.validateUpdateVariant({ ...variant, foodId })));

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

  async addNewBranchVariant(foodId: string, tenantId: string, branchId: string, payload: Array<Omit<CreateVariantInput, "foodId">>) {
    // validate food exist
    console.log(foodId, tenantId, branchId, "foodId, tenantId, branchId");
    const food = await prisma.branchFood.findUnique({
      where: {
        id: foodId,
        tenantId,
        branchId
      },
      include: {
        variants: true
      }
    });

    if (!food) throw new ApiError(httpStatus.NOT_FOUND, "Food not found");
    console.log(payload, "payload");

    // add foodId to variants
    const variantsWithFoodId = payload.map(variant => ({
      ...variant,
      foodId
    }));

    
    // validate all new variants
    await Promise.all(variantsWithFoodId.map(variant => this.branchVariantValidationService.validateCreateVariant(variant)));

    // create all new variants in transaction
    const createdVariants = await prisma.$transaction(async tx => {
      const created = await Promise.all(
        payload.map(variant =>
          tx.branchFoodVariant.create({
            data: {
              tenantId: tenantId,
              branchId: branchId,
              name: variant.name,
              basePrice: variant.basePrice,
              isActive: variant.isActive ?? true,
              isRequired: variant.isRequired ?? false,
              branchFoodId: foodId
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
              branchFoodVariantId: variant.id,
              changedById: "system",
              branchFoodId: foodId
            }
          })
        )
      );

      return created;
    });

    return createdVariants;
  }

  async deleteBranchVariant(id: string) {
    return prisma.foodVariant.update({
      where: { id },
      data: { isActive: false }
    });
  }

  async getBranchVariantsByFoodId(foodId: string) {
    return prisma.foodVariant.findMany({
      where: { foodId },
      include: {
        food: true
      }
    });
  }
}
