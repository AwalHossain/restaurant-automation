import httpStatus from "http-status";
import { z } from "zod";
import ApiError from "../../../../../errors/ApiError";
import { prisma } from "../../../../../shared/prisma";

export class BranchValidationService {
  private readonly businessHoursSchema = z.object({
    dayOfWeek: z.number().min(0).max(6),
    openingTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    closingTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    isClosed: z.boolean().optional()
  });

  private readonly createBranchSchema = z.object({
    name: z.string().min(3).max(100),
    address: z.string().min(5),
    phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
    email: z.string().email(),
    latitude: z.string(),
    longitude: z.string(),
    deliveryRadius: z.number().positive(),
    isDeliveryAvailable: z.boolean().optional().default(true),
    isTakeawayAvailable: z.boolean().optional().default(true),
    isDineInAvailable: z.boolean().optional().default(true),
    restaurantId: z.string(),
    businessHours: z.array(this.businessHoursSchema)
  });

  async validateCreateBranch(input: any) {
    try {
      const validatedData = this.createBranchSchema.parse(input);

      // Check if restaurant exists
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: validatedData.restaurantId }
      });

      if (!restaurant) {
        throw new ApiError(httpStatus.NOT_FOUND, "Restaurant not found");
      }

      // Check if branch name already exists for this restaurant
      const existingBranch = await prisma.branch.findFirst({
        where: {
          name: validatedData.name,
          restaurantId: validatedData.restaurantId
        }
      });

      if (existingBranch) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Branch name already exists for this restaurant");
      }

      // Validate business hours
      this.validateBusinessHours(validatedData.businessHours);

      return validatedData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ApiError(httpStatus.BAD_REQUEST, error.errors[0].message);
      }
      throw error;
    }
  }

  private validateBusinessHours(businessHours: any[]) {
    // Check if all days of the week are covered
    const days = new Set(businessHours.map(hour => hour.dayOfWeek));
    if (days.size !== 7) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Business hours must be provided for all days of the week");
    }

    // Validate time format and logic for each day
    businessHours.forEach(hour => {
      if (!hour.isClosed) {
        const openTime = this.parseTime(hour.openingTime);
        const closeTime = this.parseTime(hour.closingTime);

        if (openTime >= closeTime) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Invalid business hours for day ${hour.dayOfWeek}: closing time must be after opening time`
          );
        }
      }
    });
  }

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  }
}
