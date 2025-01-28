import { Request } from "express";
import httpStatus from "http-status";
import ApiError from "../../../../../errors/ApiError";
import { TenantHelper } from "../../../../../helpers/tenant.helper";
import { prisma } from "../../../../../shared/prisma";
import { CreateBranchInput, CreateRestaurantInput } from "../dtos/restaurant.dto";

import { Role } from "@prisma/client";
import { JwtUtils } from "../../../../../helpers/jwt.helper";
import { DomainService } from "../../../../Domainservices/domain.service";


export class RestaurantService {

    private domainService = new DomainService();

    constructor() {
        this.domainService = new DomainService();
    }


  async  createRestaurant(input: CreateRestaurantInput, req: Request) {
    const restaurant = await prisma.$transaction(async (tx) => {
        // check if the restaurant already exists
        const existingRestaurant = await tx.restaurant.findUnique({
            where: { 
                adminId: input.adminId
             }
        });
        console.log(existingRestaurant, "existingRestaurant");
        if (existingRestaurant) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Restaurant already exists");
        }

        console.log(existingRestaurant, "existingRestaurant");

        // get tenant id
        const tenantId = await TenantHelper.getTenantId(input.domain);
        

        const restaurant = await tx.restaurant.create({
            data: {
                name: input.name,
                domain: input.domain,
                adminId: input.userId,
                address: input.address,
                logo: input.logo,
                phoneNumber: input.phoneNumber,
                email: input.email,
                description: input.description,
                socialMediaLinks: input.socialMediaLinks,
                ratings: input.ratings,
                isActive: input.isActive,
                isSingleBranch: input.isSingleBranch,
                tenantId: tenantId,
                settings: input.settings ? {
                    create:{
                        tenantId: tenantId,
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
                }: undefined,
                pointsSystem: input.pointsSystem ? {
                    create: {
                        tenantId: tenantId,
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
                tenantId: tenantId,
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
            data: { defaultBranchId: defaultBranch.id,
                restaurantStaff: {
                    create: {
                        userId: input.adminId,
                        role: Role.ADMIN,
                        isActive: true,
                        tenantId: tenantId,
                    },
                    connect: {
                        userId_restaurantId: {
                            userId: input.adminId,
                            restaurantId: restaurant.id
                        }
                    }
                }

             },
            include: {
                settings: true,
                pointsSystem: true,
            }
        })

        await tx.auditLog.create({
            data: {
                tenantId: tenantId,
                action: 'CREATE',
                entityType: 'RESTAURANT',
                entityId: restaurant.id,
                newData: updatedRestaurant,
                userId: input.userId,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            }
        })

        // update user with tenantId
        await prisma.user.update({
            where: { id: input.userId },
            data: { tenantId: tenantId }
        })

        const accessToken = JwtUtils.generateAccessToken({
            userId: restaurant.adminId,
            role: Role.ADMIN,
            tenantId: restaurant.tenantId,
            restaurantId: restaurant.id
        });

        const refreshToken = JwtUtils.generateRefreshToken({
            userId: input.adminId,
            role: Role.ADMIN,
            tenantId: restaurant.tenantId,
            restaurantId: restaurant.id
        });

        return {
            restaurant: updatedRestaurant,
            accessToken,
            refreshToken
        };
    },{
        timeout: 25000,
    }
)

    // create default branch
    return restaurant;
  }

    async getRestaurantByDomain(domain: string) {
        const result = await prisma.restaurant.findUnique({
            where: { domain },
            include: {
                // branches: true,
                settings: true,
                branches: true
            }
        },
    );
        return result;
    }

    async getRestaurantByAdminId(adminId: string) {
        const result = await prisma.restaurant.findUnique({
            where: { adminId },
            include: {
                branches: true,
                settings: true,
                pointsSystem: true,
                restaurantStaff: true

            }
        });
        return result;
    }

    async getRestaurantByTenantId(tenantId: string) {
        const result = await prisma.restaurant.findUnique({
            where: { tenantId },
            include: {
                branches: true,
                settings: true,
                pointsSystem: true,
                restaurantStaff: true
            }
        });
        return result;
    }

    async getAllRestaurants() {
        const result = await prisma.restaurant.findMany({
            include: {
                restaurantStaff: true,
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
                        tenantId: input.tenantId,
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


    async getAllBranches(restaurantId: string, tenantId: string) {
        const result = await prisma.branch.findMany({
            where:{
                restaurantId,
                tenantId: tenantId
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
        console.log("input", input);
          // First check if settings exist for this restaurant
    const existingSettings = await prisma.restaurantSettings.findUnique({
        where: { restaurantId: input.restaurantId }
    });
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
                    // If settings don't exist, create them; if they do, update them
                    [existingSettings ? 'update' : 'create']: {
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
                }
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
           // First verify the restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
        where: { id: input.restaurantId },
        select: { tenantId: true }
    });

    if (!restaurant) {
        throw new ApiError(httpStatus.NOT_FOUND, "Restaurant not found");
    }
       
        const result = await prisma.pointsSystem.upsert({
            where: { restaurantId: input.restaurantId, tenantId: input.tenantId },
            create: {
                restaurantId: input.restaurantId,
                tenantId: restaurant.tenantId,
                isEnabled: input.pointsSystem?.isEnabled ?? false,
                pointsRate: input.pointsSystem?.pointsRate ?? 1.00,
                redemptionRate: input.pointsSystem?.redemptionRate ?? 0.50,
                minPointsRedeem: input.pointsSystem?.minPointsRedeem ?? 100,
                maxPointsRedeem: input.pointsSystem?.maxPointsRedeem ?? 10000,
                minSpendForPoints: input.pointsSystem?.minSpendForPoints ?? 100,
                pointsExpiryDays: input.pointsSystem?.pointsExpiryDays ?? 30,
                pointsExpiryType: input.pointsSystem?.pointsExpiryType ?? "DAYS",
            },
            update: {
                isEnabled: input.pointsSystem?.isEnabled,
                pointsRate: input.pointsSystem?.pointsRate,
                redemptionRate: input.pointsSystem?.redemptionRate,
                minPointsRedeem: input.pointsSystem?.minPointsRedeem,
                maxPointsRedeem: input.pointsSystem?.maxPointsRedeem,
                minSpendForPoints: input.pointsSystem?.minSpendForPoints,
                pointsExpiryDays: input.pointsSystem?.pointsExpiryDays,
                pointsExpiryType: input.pointsSystem?.pointsExpiryType
            }
        })
        return result;
    }

}


