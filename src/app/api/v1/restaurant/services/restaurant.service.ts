import { prisma } from "../../../../../shared/prisma";
import { CreateBranchInput, CreateRestaurantInput } from "../dtos/restaurant.dto";




export class RestaurantService {

  async  createRestaurant(input: CreateRestaurantInput) {
    const restaurant = await prisma.$transaction(async (tx) => {
        const restaurant = await tx.restaurant.create({
            data: {
                name: input.name,
                domain: input.domain,
                address: input.address,
                logo: input.logo,
                phoneNumber: input.phoneNumber,
                email: input.email,
                description: input.description,
                socialMediaLinks: input.socialMediaLinks,
                ratings: input.ratings,
                isActive: input.isActive,
                isSingleBranch: input.isSingleBranch,
                settings: {
                    create:{
                        currency: input.settings?.currency || 'BDT',
                        currencySymbol: input.settings?.currencySymbol || '৳',
                        timezone: input.settings?.timezone || 'Asia/Dhaka',
                        baseDeliveryFee: input.settings?.baseDeliveryFee || 0,
                        deliveryFeeCalculationType: input.settings?.deliveryFeeCalculationType || 'FIXED',
                        distanceBasedFees: input.settings?.distanceBasedFees || [],
                        minOrderAmount: input.settings?.minOrderAmount || 0,
                        maxOrderAmount: input.settings?.maxOrderAmount || 1000000,
                        taxPercentage: input.settings?.taxPercentage || 0,
                        serviceChargePercentage: input.settings?.serviceChargePercentage || 0,
                        allowGuestCheckout: input.settings?.allowGuestCheckout || false,
                        requirePhoneNumber: input.settings?.requirePhoneNumber || false,
                        requireEmail: input.settings?.requireEmail || false,
                        takeoutEnabled: input.settings?.takeoutEnabled || false,
                        takeoutServiceCharge: input.settings?.takeoutServiceCharge || 0,
                        dineInEnabled: input.settings?.dineInEnabled || false,
                        dineInServiceCharge: input.settings?.dineInServiceCharge || 0,
                        globalMessage: input.settings?.globalMessage || '',
                        globalMessageEnabled: input.settings?.globalMessageEnabled || false,
                        lastUpdatedById: input.settings?.lastUpdatedById,
                        customerSupportEmail: input.settings?.customerSupportEmail || '',
                        restaurantType: input.settings?.restaurantType || 'FINE_DINING',
                        acceptsPreorders: input.settings?.acceptsPreorders || false,
                        autoAssignRiders: input.settings?.autoAssignRiders || false,
                        smsNotifications: input.settings?.smsNotifications || false,
                        emailNotifications: input.settings?.emailNotifications || false,
                        errorNotificationEmail: input.settings?.errorNotificationEmail || '',
                        notifyOnCriticalErrors: input.settings?.notifyOnCriticalErrors || false,
                        autoResponseEnabled: input.settings?.autoResponseEnabled || false,
                        feedbackResponseDelay: input.settings?.feedbackResponseDelay || 0,
                        timezoneOffset: input.settings?.timezoneOffset || 0,
                        updatedAt: new Date(),
                    }
                },
                pointsSystem: input.pointsSystem ? {
                    create: {
                        isEnabled: input.pointsSystem.isEnabled,
                        pointsRate: input.pointsSystem.pointsRate,
                        redemptionRate: input.pointsSystem.redemptionRate,
                        minPointsRedeem: input.pointsSystem.minPointsRedeem,
                        maxPointsRedeem: input.pointsSystem.maxPointsRedeem,
                        minSpendForPoints: input.pointsSystem.minSpendForPoints,
                        pointsExpiryDays: input.pointsSystem.pointsExpiryDays,
                        pointsExpiryType: input.pointsSystem.pointsExpiryType,
                    }
                }: undefined
            },
        
            include: {
                settings: true,
            }
        });

        const defaultBranch = await tx.branch.create({
            data: {
                name: `${restaurant.name} - Main Branch`,
                isDefault: true,
                restaurantId: restaurant.id,
                address: restaurant.address || '',
                phoneNumber: restaurant.phoneNumber || '',
                email: restaurant.email || '',
                isActive: restaurant.isActive || true,
                latitude: input.latitude || '',
                longitude: input.longitude || '',
                
            }
        })

        // update restaurant with default branch id
       const updatedRestaurant = await tx.restaurant.update({
            where: { id: restaurant.id },
            data: { defaultBranchId: defaultBranch.id },
            include: {
                settings: true,
                pointsSystem: true,
            }
        })

        return updatedRestaurant;
    })

    // create default branch
    return restaurant;
  }

    async getRestaurantByDomain(domain: string) {
        const result = await prisma.restaurant.findUnique({
            where: { domain },
            include: {
                branches: true,
                settings: true
            }
        });
        return result;
    }

    async getAllRestaurants() {
        const result = await prisma.restaurant.findMany({
            include: {
                branches: {
                    include:{
                        BusinessHours: true,
                        branchDeliverySettings: true,
                        managers: true,
                        
                    }
                },
                settings: true,
                pointsSystem: true,
            }
        });
        return result;
    }


    async createBranch(input: CreateBranchInput) {
        const result = await prisma.branch.create({
            data: {
                ...input,
                branchDeliverySettings: input.branchDeliverySettings ? {
                    create: {
                        baseDeliveryFee: input.branchDeliverySettings.baseDeliveryFee ?? 0,
                        maxDeliveryRadius: input.branchDeliverySettings.maxDeliveryRadius ?? 0,
                        distanceBasedFees: input.branchDeliverySettings.distanceBasedFees ?? [],
                        deliveryZones: input.branchDeliverySettings.deliveryZones ?? []
                    }
                } : undefined
            }
        })
        return result;
    }


    async getAllBranches(restaurantId: string) {
        const result = await prisma.branch.findMany({
            where:{
                restaurantId
            }
        });
        return result;
    }

    async getBranchById(id: string) {
        const result = await prisma.branch.findUnique({
            where: { id }
        });
        return result;
    }

    // update
    // want to add restaurantId in the input in the props of the function
    async updateRestaurantSettings(input: Partial<CreateRestaurantInput> & { restaurantId: string }) {
        const result = await prisma.restaurant.update({
            where: { id: input.restaurantId },
            data: {
                name: input.name,
                domain: input.domain,
                address: input.address,
                logo: input.logo,
                phoneNumber: input.phoneNumber,
                email: input.email,
                description: input.description,
                socialMediaLinks: input.socialMediaLinks,
                ratings: input.ratings,
                isActive: input.isActive,
                isSingleBranch: input.isSingleBranch,
                settings: {
                    update:{
                        updatedAt: new Date(),
                        lastUpdatedById: input?.settings?.lastUpdatedById,
                        currency: input.settings?.currency,
                        currencySymbol: input.settings?.currencySymbol,
                        timezone: input.settings?.timezone,
                        baseDeliveryFee: input.settings?.baseDeliveryFee,
                        deliveryFeeCalculationType: input.settings?.deliveryFeeCalculationType,
                        distanceBasedFees: input.settings?.distanceBasedFees,
                        minOrderAmount: input.settings?.minOrderAmount,
                        maxOrderAmount: input.settings?.maxOrderAmount,
                        taxPercentage: input.settings?.taxPercentage,
                        serviceChargePercentage: input.settings?.serviceChargePercentage,
                        allowGuestCheckout: input.settings?.allowGuestCheckout,
                        requirePhoneNumber: input.settings?.requirePhoneNumber,
                        requireEmail: input.settings?.requireEmail,
                        takeoutEnabled: input.settings?.takeoutEnabled,
                        takeoutServiceCharge: input.settings?.takeoutServiceCharge,
                        dineInEnabled: input.settings?.dineInEnabled,
                        dineInServiceCharge: input.settings?.dineInServiceCharge,
                        globalMessage: input.settings?.globalMessage,
                        globalMessageEnabled: input.settings?.globalMessageEnabled,
                        customerSupportEmail: input.settings?.customerSupportEmail,
                        restaurantType: input.settings?.restaurantType,
                        acceptsPreorders: input.settings?.acceptsPreorders,
                        autoAssignRiders: input.settings?.autoAssignRiders,
                        smsNotifications: input.settings?.smsNotifications,
                        emailNotifications: input.settings?.emailNotifications,
                        errorNotificationEmail: input.settings?.errorNotificationEmail,
                        notifyOnCriticalErrors: input.settings?.notifyOnCriticalErrors,
                        autoResponseEnabled: input.settings?.autoResponseEnabled,
                        feedbackResponseDelay: input.settings?.feedbackResponseDelay,
                        timezoneOffset: input.settings?.timezoneOffset
                    }
                },
                // pointsSystem: input.pointsSystem ? {
                //     create: {
                //         isEnabled: input.pointsSystem.isEnabled,
                //         pointsRate: input.pointsSystem.pointsRate,
                //         redemptionRate: input.pointsSystem.redemptionRate,
                //         minPointsRedeem: input.pointsSystem.minPointsRedeem,
                //         maxPointsRedeem: input.pointsSystem.maxPointsRedeem,
                //         minSpendForPoints: input.pointsSystem.minSpendForPoints,
                //         pointsExpiryDays: input.pointsSystem.pointsExpiryDays,
                //         pointsExpiryType: input.pointsSystem.pointsExpiryType,
                //     }
                // }: undefined
            }
        })
        return result;
    }


    // update restaurant points system
    async updateRestaurantPointsSystem(input: Partial<CreateRestaurantInput> & { restaurantId: string }) {
        const result = await prisma.pointsSystem.update({
            where: { restaurantId: input.restaurantId
             },
            data: {
                isEnabled: input.pointsSystem?.isEnabled,
                pointsRate: input.pointsSystem?.pointsRate,
                redemptionRate: input.pointsSystem?.redemptionRate,
                minPointsRedeem: input.pointsSystem?.minPointsRedeem,
                maxPointsRedeem: input.pointsSystem?.maxPointsRedeem,
                minSpendForPoints: input.pointsSystem?.minSpendForPoints,
                pointsExpiryDays: input.pointsSystem?.pointsExpiryDays,
                pointsExpiryType: input.pointsSystem?.pointsExpiryType,
            }
        })
        return result;
    }

}


