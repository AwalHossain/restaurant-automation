import { BusinessHours } from "@prisma/client";
import httpStatus from "http-status";
import { z } from "zod";
import ApiError from "../../../../../errors/ApiError";
import { prisma } from "../../../../../shared/prisma";

export class BranchValidationService {

    // Define days of week for reference
    private readonly DAYS_OF_WEEK = [
      'Friday',
      'Saturday',
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday'
    ] as const;

    private readonly businessHoursSchema = z.object({
      dayOfWeek: z.number().min(0).max(6),
      openingTime: z.string().regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Opening time must be in 24-hour format (HH:mm)"
      ),
      closingTime: z.string().regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Closing time must be in 24-hour format (HH:mm)"
      ),
      isClosed: z.boolean().optional().default(false),
      orderReceivingStart: z.string()
        .regex(
          /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
          "Order receiving start time must be in 24-hour format (HH:mm)"
        )
        .optional(),
      orderReceivingEnd: z.string()
        .regex(
          /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
          "Order receiving end time must be in 24-hour format (HH:mm)"
        )
        .optional(),
      temporaryClose: z.boolean().optional().default(false),
      temporaryCloseStart: z.string()
        .optional(),
      temporaryCloseEnd: z.string()
        .optional(),
      temporaryCloseReasonMessage: z.string().optional()
    });

  private readonly createBranchSchema = z.object({
    name: z.string().min(3).max(100),
    description: z.string().optional(),
    address: z.string().min(5),
    phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
    email: z.string().email(),
    latitude: z.string().regex(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/),
    longitude: z.string().regex(/^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/),
    deliveryRadius: z.number().positive(),
    isDeliveryAvailable: z.boolean().optional().default(true),
    isTakeawayAvailable: z.boolean().optional().default(true),
    isDineInAvailable: z.boolean().optional().default(true),
    restaurantId: z.string(),
    businessHours: z.array(this.businessHoursSchema),
    branchDeliverySettings: z.object({
      baseDeliveryFee: z.number(),
      deliveryZones: z.array(z.object({
        zone: z.string(),
        fee: z.number()
      })).optional(),
      distanceBasedFees: z.array(z.object({
        ranges: z.array(z.object({
          minKm: z.number(),
          maxKm: z.number(),
          fee: z.number()
        })).optional(),
        extraKmCharge: z.number(), // Extra km charge
        defaultFee: z.number() // Default fee for the zone
        
      })).optional(),
      maxDeliveryRadius: z.number()
    })
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
      console.log(error, "error");
      if (error instanceof z.ZodError) {

        // format error message
        const formattedError = error.errors.map(err => {
          const path = err.path.join('.');
          const message = err.message;
          
          return `${path}: ${message}`;
        }).join(', ');

        throw new ApiError(httpStatus.BAD_REQUEST,
          `Validation failed: ${formattedError}`);
      }
      throw error;
    }
  }

  private validateBusinessHours(businessHours: any[]) {
    // Check if all days of the week are covered
    const days = new Set(businessHours.map(hour => hour.dayOfWeek));
    console.log(days, "days");

    for(let i=0; i<7; i++){
      console.log(this.DAYS_OF_WEEK[i], "day", days.has(this.DAYS_OF_WEEK[i]));
      if(!days.has(i)){
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Missing Business hours for ${this.DAYS_OF_WEEK[i]}`
        )
      }
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

        if(hour.orderReceivingStart && hour.orderReceivingEnd){
          const orderStart = this.parseTime(hour.orderReceivingStart);
          const orderEnd = this.parseTime(hour.orderReceivingEnd);

          if(orderStart >= orderEnd){
            throw new ApiError(
              httpStatus.BAD_REQUEST,
              `Invalid order receiving hours for day ${hour.dayOfWeek}: order receiving end must be after start`
            )
          }
          if(orderStart < openTime || orderEnd > closeTime){
           throw new ApiError(
             httpStatus.BAD_REQUEST,
             `Order receiving hours must be within business hours for ${this.DAYS_OF_WEEK[hour.dayOfWeek]}`
           );
          }


          // check if temporary close is past current date
          // if(hour.temporaryCloseStart && new Date(hour.temporaryCloseStart) < new Date()){
          //   throw new ApiError(
          //     httpStatus.BAD_REQUEST,
          //     `Temporary close start date must be in the future for ${this.DAYS_OF_WEEK[hour.dayOfWeek]}`
          //   )
          // }

        }
      }
    });
  }

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  }


  // validate update branch
  async validateUpdateBranch(input: any) {
    const validatedData = this.createBranchSchema.partial().parse(input);

    //  check if branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: input.id }
    });

    if(!branch){
      throw new ApiError(httpStatus.NOT_FOUND, "Branch not found");
    }

    return validatedData;
  }


  async validateUpdateBusinessHours(branchId: string, businessHours: Partial<BusinessHours>[]) {
    try {
      const existing= await prisma.businessHours.findMany({
        where: { branchId }
      });
      // first get existing business hours
      console.log(businessHours, "businessHours hooping", existing);
      const existingBusinessHours = await prisma.businessHours.findMany({
        where: { branchId }
      });

      // validate each provided business hours
      const validatedHours = businessHours.map(hour=>{
        const validated = this.businessHoursSchema.partial().parse(hour);
        if(!validated.isClosed){
          const openTime = this.parseTime(validated.openingTime!);
          const closeTime = this.parseTime(validated.closingTime!);

          if (openTime >= closeTime) {
            throw new ApiError(
              httpStatus.BAD_REQUEST,
              `Invalid business hours for day ${hour.dayOfWeek}: closing time must be after opening time`
            );
          }

          // validate order receiving hours if provided
          if(validated.orderReceivingStart && validated.orderReceivingEnd){
            const orderStart = this.parseTime(validated.orderReceivingStart);
            const orderEnd = this.parseTime(validated.orderReceivingEnd);
    
            if(orderStart >= orderEnd){
              throw new ApiError(
                httpStatus.BAD_REQUEST,
                `Invalid order receiving hours for day ${hour.dayOfWeek}: order receiving end must be after start`
              )
            }
            if(orderStart < openTime || orderEnd > closeTime){
             throw new ApiError(
               httpStatus.BAD_REQUEST,
               `Order receiving hours must be within business hours for ${this.DAYS_OF_WEEK[validated.dayOfWeek!]}`
             );
            }
          }

        }

        return validated; 
        
      })
      //create a map of existing hours for easy lookup
      const existingHoursMap = new Map(
        existingBusinessHours.map(h => [h.dayOfWeek, h])
      )

      // prepare final hours daa for update
      const hoursToUpdate = validatedHours.map(hour=>{
        const existing = existingHoursMap.get(hour.dayOfWeek?.toString()!);

        return {
          id: existing?.id,
          dayOfWeek: hour.dayOfWeek?.toString(),
          ...hour
        }
      })
      return hoursToUpdate;

    } catch (error) {
      if(error instanceof z.ZodError){
        throw new ApiError(httpStatus.BAD_REQUEST, error.errors[0].message);
      }
      throw error;
    }
  }
}
