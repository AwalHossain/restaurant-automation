import httpStatus from 'http-status';
import { z } from 'zod';
import ApiError from '../../../../../errors/ApiError';
import { CreateBranchInput, CreateRestaurantInput } from '../dtos/restaurant.dto';

export class RestaurantValidationService {
  async validateCreateRestaurantInput(input: CreateRestaurantInput) {
    try {
      const validatedData = this.createRestaurantSchema.parse(input);
      
      return validatedData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Invalid restaurant data',
          error.errors.map(err => err.message).join(', ')
        );
      }
      throw error;
    }
  }

  async validateCreateBranchInput(input: CreateBranchInput) {
    try {
      const validatedData = this.createBranchSchema.parse(input);
      return validatedData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Invalid branch data',
          error.errors.map(err => err.message).join(', ')
        );
      }
      throw error;
    }
  }

  private createRestaurantSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    domain: z.string().min(3, 'Domain must be at least 3 characters'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    latitude: z.string().regex(/^-?([0-8]?[0-9]|90)(\.[0-9]{1,10})$/),
    longitude: z.string().regex(/^-?([0-9]{1,2}|1[0-7][0-9]|180)(\.[0-9]{1,10})$/),
    phoneNumber: z.string().regex(/^\+?[\d\s-]{8,}$/, 'Invalid phone number format'),
    email: z.string().email('Invalid email format'),
    logo: z.string().url().optional(),
    description: z.string().optional(),
    socialMediaLinks: z.array(z.string().url()).optional(),
    ratings: z.number().min(0).max(5).optional(),
    featured: z.boolean().optional(),
    settings: z.object({
      currency: z.string().default('BDT'),
      currencySymbol: z.string().optional(),
      timezone: z.string().default('Asia/Dhaka'),
      baseDeliveryFee: z.number().min(0).optional(),
      deliveryFeeCalculationType: z.enum(['FIXED', 'DISTANCE', 'ZONE']).optional(),
      distanceBasedFees: z.array(z.object({
          baseFee: z.number().min(0),
          perKmCharge: z.number().min(0),
          ranges: z.array(z.object({
              minKm: z.number().min(0),
              maxKm: z.number().min(0),
              fee: z.number().min(0),
              estimatedTime: z.object({
                  minMinutes: z.number().min(0),
                  maxMinutes: z.number().min(0)
              })
          }))
      })).optional(),
      zoneBasedFees: z.array(z.object({
          zones: z.array(z.object({
              name: z.string(),
              fee: z.number().min(0),
              estimatedTime: z.object({
                  minMinutes: z.number().min(0),
                  maxMinutes: z.number().min(0)
              })
          }))
      })).optional(),
      minOrderAmount: z.number().min(0).optional(),
      maxOrderAmount: z.number().min(0).optional(),
      taxPercentage: z.number().min(0).max(100).optional(),
      serviceChargePercentage: z.number().min(0).max(100).optional(),
      
      // Checkout settings
      allowGuestCheckout: z.boolean().optional(),
      requirePhoneNumber: z.boolean().optional(),
      requireEmail: z.boolean().optional(),
      
      // Service settings
      takeoutEnabled: z.boolean().optional(),
      takeoutServiceCharge: z.number().min(0).optional(),
      dineInEnabled: z.boolean().optional(),
      dineInServiceCharge: z.number().min(0).optional(),
      
      // Messages
      globalMessage: z.string().optional(),
      globalMessageEnabled: z.boolean().optional(),
      
      // Support and notifications
      customerSupportEmail: z.string().email().optional(),
      restaurantType: z.enum(['FAST_FOOD', 'FINE_DINING', 'CAFE']).optional(),
      acceptsPreorders: z.boolean().optional(),
      autoAssignRiders: z.boolean().optional(),
      smsNotifications: z.boolean().optional(),
      emailNotifications: z.boolean().optional(),
      errorNotificationEmail: z.string().email().optional(),
      notifyOnCriticalErrors: z.boolean().optional(),
      autoResponseEnabled: z.boolean().optional(),
      feedbackResponseDelay: z.number().min(0).optional(),
      
      // Time settings
      timezoneOffset: z.number().min(-12).max(14).optional(),
      lastUpdatedById: z.string().optional(),
      updatedAt: z.date().optional()
  }).optional()
  });

  private businessHoursSchema = z.object({
    dayOfWeek: z.number().min(0).max(6),
    openingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    closingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    isClosed: z.boolean()
  });

  private createBranchSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    phoneNumber: z.string().regex(/^\+?[\d\s-]{8,}$/, 'Invalid phone number format'),
    email: z.string().email('Invalid email format'),
    latitude: z.string().regex(/^-?([0-8]?[0-9]|90)(\.[0-9]{1,10})$/),
    longitude: z.string().regex(/^-?([0-9]{1,2}|1[0-7][0-9]|180)(\.[0-9]{1,10})$/),
    deliveryRadius: z.number().positive(),
    isDeliveryAvailable: z.boolean().optional(),
    isTakeawayAvailable: z.boolean().optional(),
    isDineInAvailable: z.boolean().optional(),
    restaurantId: z.string(),
    businessHours: z.array(this.businessHoursSchema)
  });
}