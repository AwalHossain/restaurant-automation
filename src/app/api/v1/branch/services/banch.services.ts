import { prisma } from "../../../../../shared/prisma";
import { CreateBranchInput } from "../../restaurant/dtos/restaurant.dto";
import { BranchValidationService } from "../validation/branch.validation";

export class BranchService {
  constructor(private readonly branchValidationService: BranchValidationService) {
    this.branchValidationService = new BranchValidationService();
  }

  async createBranch(input: CreateBranchInput) {
    // Validate input
    const validatedData = await this.branchValidationService.validateCreateBranch(input);

    // Create branch with business hours in a transaction
    const branch = await prisma.$transaction(async tx => {
      // Create the branch
      const createdBranch = await tx.branch.create({
        data: {
          name: validatedData.name,
          address: validatedData.address,
          phoneNumber: validatedData.phoneNumber,
          email: validatedData.email,
          latitude: validatedData.latitude,
          longitude: validatedData.longitude,
          deliveryRadius: validatedData.deliveryRadius,
          isDeliveryAvailable: validatedData.isDeliveryAvailable,
          isTakeawayAvailable: validatedData.isTakeawayAvailable,
          isDineInAvailable: validatedData.isDineInAvailable,
          restaurantId: validatedData.restaurantId
        }
      });

      // Create business hours
      await Promise.all(
        validatedData.businessHours.map(hour =>
          tx.businessHours.create({
            data: {
              branchId: createdBranch.id,
              dayOfWeek: hour.dayOfWeek.toString(),
              openingTime: hour.openingTime,
              closingTime: hour.closingTime,
              isClosed: hour.isClosed || false
            }
          })
        )
      );

      // Return branch with business hours
      return await tx.branch.findUnique({
        where: { id: createdBranch.id },
        include: {
          BusinessHours: true
        }
      });
    });

    return branch;
  }

  // Continue with other methods...
}
