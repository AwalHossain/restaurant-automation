import { Request } from "express";
import httpStatus from "http-status";
import ApiError from "../../../../../errors/ApiError";
import { TenantHelper } from "../../../../../helpers/tenant.helper";
import { prisma } from "../../../../../shared/prisma";
import { CreateRestaurantInput } from "../dtos/restaurant.dto";

import { AuditLogAction, Branch, Prisma, Role } from "@prisma/client";
import { JwtUtils } from "../../../../../helpers/jwt.helper";
import { withRetry } from "../../../../../utils/retry.utils";
import { DomainService } from "../../../../Domainservices/domain.service";
import { BranchValidationService } from "../../branch/validation/branch.validation";
import { PermissionService } from "../../role-permission/services/permission.service";
import { RoleService } from "../../role-permission/services/role.service";
import { RestaurantSetupState } from "../types/restaurant.types";
import { RestaurantMonitorService } from "./restaurant-monitor.service";


export class RestaurantService {

    private domainService = new DomainService();
    private roleService = new RoleService();
    private permissionService = new PermissionService();
    private restaurantMonitorService = new RestaurantMonitorService();
    private branchValidationService = new BranchValidationService();

    constructor() {
        this.domainService = new DomainService();
        this.permissionService = new PermissionService()
        this.restaurantMonitorService = new RestaurantMonitorService();
        this.roleService = new RoleService();
        this.branchValidationService = new BranchValidationService();
    }

    // create restaurant
    async createRestaurant(input: CreateRestaurantInput, req: Request) {
            // check if the restaurant already exists
    const existingRestaurant = await prisma.restaurant.findUnique({
        where: { 
            adminId: input.adminId
         }
    });
    console.log(existingRestaurant, "existingRestaurant");
    if (existingRestaurant) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Restaurant already exists");
    }

    // check if the domain already exists
    const existingDomain = await prisma.restaurant.findUnique({
        where: {
            domain: input.domain
        }
    });
    if (existingDomain) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Domain already exists");
    }
    console.log(existingDomain, "existingDomain");

     // wrap the entire restaurant creation process in a retry mechanism
     const result = await withRetry(
        async () => this.executeRestaurantCreation(input, req),
        3, // number of retries
        1000, // delay between retries
        // Track progress on each retry
    ).catch(async (error) => {
        // Only track the final failure
        await this.restaurantMonitorService.trackSetupProgress({
            currentState: RestaurantSetupState.FAILED,
            error: error as Error,
            restaurant: null,
        });
        // Re-throw the original error
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create restaurant");
    });

    // Track success
    await this.restaurantMonitorService.trackSetupProgress({
        currentState: RestaurantSetupState.COMPLETED,
        error: undefined,
        restaurant: result,
    });

    return result;
    //    } catch (error) {
    //     await this.restaurantMonitorService.trackSetupProgress({
    //         currentState: RestaurantSetupState.FAILED,
    //         error: error as Error,
    //         restaurant: null,
    //     })
    //     console.log(error, "error");
    //     throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create restaurant");
    //    }
    }


 private  async executeRestaurantCreation(input: CreateRestaurantInput, req: Request) {


    return await prisma.$transaction(async (tx)=>{
        // try{
            // step 1: Initialize Restaurant Setup
            const tenantId = await TenantHelper.generateTenantId(input.domain)

            // step 2: Seed Permissions(Idempotent Operation)
            await this.permissionService.seedPermissions(tx, tenantId)

            // step 3: Create Restaurant
            const restaurant = await this.createRestaurantEntity(tx, input, tenantId)

            // step 4: Create Default Brancch & roles
            const [defaultBranch, defaultRoles] = await Promise.all([
                this.createDefaultBranch(tx, restaurant, input, tenantId, req),
                this.roleService.createDefaultRole(tx, tenantId)
            ])
            console.log(defaultRoles, "defaultRoles");
            // step 5: Setup admin access
            await this.setupAdminAccess(tx, {
                restaurant,
                defaultRoles,
                tenantId,
                userId: input.userId
            })


            // step 6: Finalize Restaurant Setup

            const finalizedSetup = await this.finalizeRestaurantSetup(tx, {
                restaurant,
                defaultBranch,
                tenantId,
                userId: input.userId,
                req: req
            })

            return finalizedSetup;

        // }catch(error){
        //     console.error(error)
        //     throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create restaurant")
        // }
    },{
        timeout: 50000,
        maxWait: 5000,
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // strongest isolation level
    }
)

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
                        businessHours: true,
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



    private async createRestaurantEntity(tx: Prisma.TransactionClient, input: CreateRestaurantInput, tenantId: string) {
       
      const settingsData = input.settings ? {
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
}: undefined

// points system data
const pointsSystemData = input.pointsSystem ? {
    tenantId: tenantId,
    isEnabled: input.pointsSystem.isEnabled,
    pointsRate: input.pointsSystem.pointsRate,
    redemptionRate: input.pointsSystem.redemptionRate,
    minPointsRedeem: input.pointsSystem.minPointsRedeem,
    maxPointsRedeem: input.pointsSystem.maxPointsRedeem,
    minSpendForPoints: input.pointsSystem.minSpendForPoints,
    pointsExpiryDays: input.pointsSystem.pointsExpiryDays,
    pointsExpiryType: input.pointsSystem.pointsExpiryType,
}: undefined

       
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
                settings: settingsData ? {
                    create: settingsData
                }: undefined,
                pointsSystem: pointsSystemData ? {
                    create: pointsSystemData
                }: undefined
            },
        
            include: {
                settings: true,
            }
        })

        return restaurant;
    }

    private async createDefaultBranch(tx: Prisma.TransactionClient, restaurant: any, input: any, tenantId: string, req: Request) {
        input.tenantId = tenantId;
        input.restaurantId = restaurant.id;
        input.deliveryRadius = input.deliveryRadius || 5;
        input.isActive = input.isActive || true;

        console.log(input, "input", restaurant, "restaurant", tenantId, "tenantId");

        // validate branch input
        const validatedData = await this.branchValidationService.validateCreateBranch(input, tx);
      
        const branch = await tx.branch.create({
            data: {
                name: `${validatedData.name} - Main Branch`,
                tenantId: tenantId,
                isDefault: true,
                restaurantId: validatedData.restaurantId,
                address: validatedData.address,
                phoneNumber: validatedData.phoneNumber,
                email: validatedData.email,
                latitude: validatedData.latitude,
                longitude: validatedData.longitude,
              
                branchDeliverySettings: {
                    create:{
                      tenantId: validatedData?.tenantId ?? "",  
                      baseDeliveryFee: validatedData?.branchDeliverySettings?.baseDeliveryFee ?? 0,
                      maxDeliveryRadius: validatedData?.branchDeliverySettings?.maxDeliveryRadius ?? 0,
                      distanceBasedFees: validatedData?.branchDeliverySettings?.distanceBasedFees ?? [],
                      deliveryZones: validatedData?.branchDeliverySettings?.deliveryZones ?? []
                    }
                  },
                  // business hours
                  businessHours: {
                    create: validatedData?.businessHours?.map(h =>
                      {
                        const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
                        return {
                      tenantId: validatedData?.tenantId ?? "",
                      dayOfWeek: h.dayOfWeek.toString(),
                      openingTime: h.openingTime,
                      closingTime: h.closingTime,
                      isClosed: h.isClosed || false,
                      orderReceivingStart: h.orderReceivingStart,
                      orderReceivingEnd: h.orderReceivingEnd,
                      temporaryClose: h.temporaryClose || false,
                      temporaryCloseStart: h.temporaryCloseStart,
                      temporaryCloseEnd: h.temporaryCloseEnd,
                      temporaryCloseReasonMessage: h.temporaryCloseReasonMessage
                    }
                  })
                  },
        
                 auditLogs:{
                  create:{
                    userId: input.userId,
                    tenantId: validatedData.tenantId,
                    action: AuditLogAction.CREATE,
                    entityType: "BRANCH",
                    entityId: "PENDING",
                    newData: {
                      ...validatedData,
                      id: "PENDING"
                    },
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent']
                  }
                 }
            },
            
        })
        return branch;
    }


    private async setupAdminAccess(tx: Prisma.TransactionClient, 
        params:{
            restaurant: any,
            defaultRoles: any,
            tenantId: string,
            userId: string
        }
    ) {
        // Debug the roles
        console.log("Default Roles:", params.defaultRoles);
        
        // Find the admin role
        const adminRole = params.defaultRoles.roles.find((role: any) => role.name === "RESTAURANT_ADMIN");
        console.log("Admin Role:", adminRole);
    
        if (!adminRole?.id) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Restaurant admin role not found");
        }
    
        // Verify all required data
        const staffData = {
            userId: params.userId,
            roleId: adminRole.id,
            tenantId: params.tenantId,
            restaurantId: params.restaurant.id,
        };
        
        console.log("Staff Data to be created:", staffData);
    
        // Verify role exists in the transaction
        const roleExists = await tx.userRole.findFirst({
            where: { id: adminRole.id,
                tenantId: params.tenantId,
             }
        });
    
        console.log("Role exists check:", roleExists);
    
        if (!roleExists) {
            throw new ApiError(httpStatus.BAD_REQUEST, `Role with ID ${adminRole.id} not found in database`);
        }
    
        try {
            // create restaurant staff entry for admin using explicit connections
            const createdStaff = await tx.restaurantStaff.create({
                data: {
                    userId: params.userId,
                    tenantId: params.tenantId,
                    restaurantId: params.restaurant.id,
                    roleId: adminRole.id
                }
            });
    
            console.log("Created RestaurantStaff:", createdStaff);
    
            // update user with tenant
            await tx.user.update({
                where: {
                    id: params.userId
                },
                data: {
                    tenantId: params.tenantId
                }
            });
    
            return createdStaff;
        } catch (error) {
            console.error("Error creating restaurant staff:", error);
            console.log("Full error details:", JSON.stringify(error, null, 2));
            throw new ApiError(
                httpStatus.INTERNAL_SERVER_ERROR, 
                `Failed to create restaurant staff: ${error}`
            );
        }
    }

    // finalize restaurant setup
    private async finalizeRestaurantSetup(tx: Prisma.TransactionClient, params:{
        restaurant: any,
        defaultBranch: Branch,
        tenantId: string,
        userId: string,
        req: Request
    }) {

        const {restaurant, defaultBranch, tenantId, userId, req} = params;

        // update restaurant with default branch id
     const updatedRestaurant = await tx.restaurant.update({
            where: { id: restaurant.id },
            data: { defaultBranchId: defaultBranch.id }
        })

        // create audit log
        await tx.auditLog.create({
            data: {
                tenantId: tenantId,
                action: 'CREATE',
                entityType: 'RESTAURANT',
                entityId: restaurant.id,
                userId: userId,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            }
        })

        return {
            restaurant: updatedRestaurant,
            accessToken: JwtUtils.generateAccessToken({
                userId: userId,
                role: Role.ADMIN,
                tenantId: tenantId,
                restaurantId: restaurant.id
            }),
            refreshToken: JwtUtils.generateRefreshToken({
                userId: userId,
                role: Role.ADMIN,
                tenantId: tenantId,
                restaurantId: restaurant.id
            })
        }
    }


}


