import httpStatus from 'http-status';
import ApiError from '../../../../../errors/ApiError';
import { prisma } from '../../../../../shared/prisma';
import { CreateVariantInput, UpdateVariantInput, createVariantSchema, updateVariantSchema } from '../dtos/variants.dto';

export class VariantValidationService {
  async validateCreateVariant(input: CreateVariantInput) {
    try {
      await createVariantSchema.parseAsync(input);

      // Check if food exists
      const food = await prisma.food.findUnique({
        where: { id: input.foodId },
        include: { variants: true }
      });

      if (!food) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Food not found');
      }

      // Check for duplicate variant names
      const existingVariant = food.variants.find(
        v => v.name.toLowerCase() === input.name.toLowerCase()
      );

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

  async validateUpdateVariant(input: UpdateVariantInput) {
    try {
      await updateVariantSchema.parseAsync(input);

      const variant = await prisma.foodVariant.findUnique({
        where: { id: input.id },
        include: {
          food: {
            include: { variants: true }
          }
        }
      });

      if (!variant) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Variant not found');
      }

      // Check for duplicate names if name is being updated
      if (input.name) {
        const duplicateName = variant.food.variants.find(
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
