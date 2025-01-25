import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';
import { prisma } from '../../shared/prisma';
import { CreateVariantInput, createVariantSchema, UpdateVariantInput, updateVariantSchema } from './branch-variant.dto';


export class BranchVariantValidationService {
  async validateCreateVariant(input: CreateVariantInput) {
    try {
      await createVariantSchema.parseAsync(input);

      // Check if food exists
      const food = await prisma.branchFood.findUnique({
        where: { id: input.foodId },
        include: { variants: true }
      });

      console.log(food, "food");

      if (!food) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Food not found');
      }

      // Check for duplicate variant names
      const existingVariant = food.variants.find(
        v => v.name.toLowerCase() === input.name.toLowerCase()
      );

      console.log(food.basePrice, "food", input.basePrice, "input",Number(input.basePrice) < Number(food.basePrice) );

      // validate variant price
      if(Number(input.basePrice) < Number(food.basePrice)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Variant price cannot be less than the food base price');
      }

      if (existingVariant) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'A variant with this name already exists for this food'
        );
      }

      return input;
    } catch (error) {
      throw error;
    }
  }

  async validateUpdateVariant(input: UpdateVariantInput & { foodId: string }) {
    try {
      await updateVariantSchema.parseAsync(input);

      const variant = await prisma.branchFoodVariant.findUnique({
        where: { id: input.id },
        include: {
          branchFood: {
            include: { variants: true }
          }
        }
      });

      if (!variant) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Variant not found');
      }

      // Check for duplicate names if name is being updated
      if (input.name) {
        const duplicateName = variant.branchFood.variants.find(
          v => v.id !== input.id && v.name.toLowerCase() === input?.name?.toLowerCase()
        );

        if (duplicateName) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            'A variant with this name already exists for this food'
          );
        }
      }

      return input;
    } catch (error) {
      throw error;
    }
  }
}
