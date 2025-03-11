import { AuditLogAction, BusinessHours, NotificationType } from "@prisma/client";
import { Request } from "express";
import httpStatus from "http-status";
import ApiError from "../../../../../errors/ApiError";
import { prisma } from "../../../../../shared/prisma";
import { CreateBranchInput } from "../../restaurant/dtos/restaurant.dto";
import { DeleteBranchInput, UpdateBranchStatusInput } from "../dtos/branch.dtos";
import { BranchValidationService } from "../validation/branch.validation";

export class BranchService {
  constructor(private readonly branchValidationService: BranchValidationService) {
    this.branchValidationService = new BranchValidationService();
  }

  async createBranch(input: CreateBranchInput, userId: string, req: Request) {
    // Validate input
    const validatedData = await this.branchValidationService.validateCreateBranch(input);
console.log(validatedData, "validatedData");
    // Create branch with business hours in a transaction
    const branch = await prisma.$transaction(async tx => {
      // Create the branch
      const createdBranch = await tx.branch.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          tenantId: validatedData.tenantId,
          address: validatedData.address,
          phoneNumber: validatedData.phoneNumber,
          email: validatedData.email,
          latitude: validatedData.latitude,
          longitude: validatedData.longitude,
          deliveryRadius: validatedData.deliveryRadius,
          isDeliveryAvailable: validatedData.isDeliveryAvailable,
          isTakeawayAvailable: validatedData.isTakeawayAvailable,
          isDineInAvailable: validatedData.isDineInAvailable,
          restaurantId: validatedData.restaurantId,
        // delivery settings
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
            userId,
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
        include: {
          businessHours: true,
          branchDeliverySettings: true,
          managers: true
        }
      });


      // Create Notification fro admins
      await tx.notification.create({
        data: {
          userId,
          tenantId: validatedData.tenantId,
          type: NotificationType.SYSTEM,
          title: "New Branch Created",
          message: `A new branch has been created: ${createdBranch.name}`,
          data: {
            branchId: createdBranch.id
          }
        }
      })


      return createdBranch;
    });

    return branch;
  }


  // get branch by id
  async getBranchById(id: string) {
    const branch = await prisma.branch.findUnique({
      where: { id },
      include: {
        businessHours: true,
        branchDeliverySettings: true,
        managers: true,
        branchStaff: true,
      }
    });

    console.log(branch, "branch details");

    if(!branch){
      throw new ApiError(httpStatus.NOT_FOUND, "Branch not found");
    }

    return branch;
  }


  // update branch status
  async updateBranchStatus(input: UpdateBranchStatusInput) {
    return await prisma.$transaction(async tx => {
      console.log("Searching for branch with ID:", input.branchId);
    
      // First, verify the branch exists with a direct query
      const branchExists = await tx.branch.count({
        where: { id: input.branchId }
      });
      console.log("Branch exists?", branchExists > 0);
  
      // Get the branch details
      const branch = await tx.branch.findUnique({
        where: { id: input.branchId },
      });
      
      console.log("Branch details:", branch);
  
      if (!branch) {
        // Log more details about the failed lookup
        console.log("Branch lookup failed. Input:", {
          providedId: input.branchId,
          idType: typeof input.branchId,
          idLength: input.branchId.length
        });
        
        throw new ApiError(httpStatus.NOT_FOUND, "Branch not found");
      }

      await tx.branch.update({
        where: { id: branch.id },
        data: { 
      // toggle isActive
      isActive: !branch.isActive
       }
      });

      // create audit log
      await tx.auditLog.create({
        data: {
          userId: input.userId,
          tenantId: branch.tenantId,
          action: AuditLogAction.UPDATE,
          entityType: "BRANCH",
          entityId: branch.id,
          oldData: {
            isActive: "PENDING"
          },
          newData: {
            isActive: !branch.isActive
          },
          ipAddress: input.req.ip,
          userAgent: input.req.headers['user-agent']
        }
      })
    });


  }


  // update branch data only
  async updateBranchBasicInfo(input: Partial<CreateBranchInput> & { branchId: string }) {
    
    const validatedData = await this.branchValidationService.validateUpdateBranch(input);
    return await prisma.$transaction(async (tx) => {
    await tx.branch.update({
      where: { id: input.branchId },
      data: {
        name: validatedData.name,
        address: validatedData.address,
        description: validatedData.description,
        phoneNumber: validatedData.phoneNumber,
        email: validatedData.email,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        deliveryRadius: validatedData.deliveryRadius,
        isDeliveryAvailable: validatedData.isDeliveryAvailable,
        isTakeawayAvailable: validatedData.isTakeawayAvailable,
        isDineInAvailable: validatedData.isDineInAvailable,
      }
    });

    return await tx.branch.findUnique({where: {id: input.branchId}});
  });
  }

  async updateBranchDeliverySettings(input: Partial<CreateBranchInput> & { branchId: string }) {
    const validatedData = await this.branchValidationService.validateUpdateBranchDeliverySettings(input);
    
    return await prisma.$transaction(async (tx) => {
      // First check if the record exists
      const existingSettings = await tx.branchDeliverySettings.findUnique({
        where: { branchId: input.branchId, tenantId: input?.tenantId ?? "" }
      });
      const first = await tx.branchDeliverySettings.findFirst({where: {branchId: input.branchId, tenantId: input?.tenantId ?? ""}});
      console.log('Existing Settings:', existingSettings, input?.tenantId, input.branchId, "first", first); // Debug log

      if (!existingSettings) {
        // Create if doesn't exist
        return await tx.branchDeliverySettings.create({
          data: {
            branchId: input.branchId,
            tenantId: input?.tenantId ?? "",
            baseDeliveryFee: validatedData.branchDeliverySettings?.baseDeliveryFee ?? 0,
            maxDeliveryRadius: validatedData.branchDeliverySettings?.maxDeliveryRadius ?? 0,
            distanceBasedFees: validatedData.branchDeliverySettings?.distanceBasedFees ?? [],
            deliveryZones: validatedData.branchDeliverySettings?.deliveryZones ?? []
          }
        });
      }

      // Update if exists
      return await tx.branchDeliverySettings.update({
        where: { branchId: input.branchId },
        data: {
          baseDeliveryFee: validatedData.branchDeliverySettings?.baseDeliveryFee,
          maxDeliveryRadius: validatedData.branchDeliverySettings?.maxDeliveryRadius,
          distanceBasedFees: validatedData.branchDeliverySettings?.distanceBasedFees,
          deliveryZones: validatedData.branchDeliverySettings?.deliveryZones
        }
      });
    });
}


  // update branch business hours
  async updateBranchBusinessHours(input: {branchId: string, businessHours: BusinessHours[], userId: string,tenantId: string, ipAddress: string, userAgent: string}) {
   
    const validatedData = await this.branchValidationService.validateUpdateBusinessHours(input.branchId, input.businessHours);
    console.log(validatedData, "validatedData", input.branchId);
    return await prisma.$transaction(async tx => {
      
      // update existing business hours
      for(const hour of validatedData){
        if(hour.id){
          const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
        await tx.businessHours.update({
          where: { id: hour.id },
          data: {
            openingTime: hour.openingTime,
            closingTime: hour.closingTime,
            isClosed: hour.isClosed,
            orderReceivingStart: hour.orderReceivingStart,
            orderReceivingEnd: hour.orderReceivingEnd,
            temporaryClose: hour.temporaryClose || false,
            temporaryCloseStart: hour.temporaryCloseStart,
            temporaryCloseEnd: hour.temporaryCloseEnd,
            temporaryCloseReasonMessage: hour.temporaryCloseReasonMessage
            }
          })
        }else{
          await tx.businessHours.create({
            data: {
              tenantId: input?.tenantId ?? "",
              branchId: input.branchId,
              dayOfWeek: hour.dayOfWeek!.toString(),
              openingTime: hour.openingTime!,
              closingTime: hour.closingTime!,
              isClosed: hour.isClosed,
              orderReceivingStart: hour.orderReceivingStart,
              orderReceivingEnd: hour.orderReceivingEnd,
              temporaryClose: hour.temporaryClose,
              temporaryCloseStart: hour.temporaryCloseStart,
              temporaryCloseEnd: hour.temporaryCloseEnd,
              temporaryCloseReasonMessage: hour.temporaryCloseReasonMessage
            }
          })
        }
      }

      // create audit log
      await tx.auditLog.create({
        data: {
          userId: input.userId,
          tenantId: input.tenantId,
          action: AuditLogAction.UPDATE,
          entityType: "Branch_Business_Hours",
          entityId: input.branchId,
          newData: {
            businessHours: validatedData
          },
          ipAddress: input.ipAddress,
          userAgent: input.userAgent
        }
      })

      return await tx.businessHours.findMany({where: {branchId: input.branchId}});
    });
  }



  // get all branch
  async getAllBranch() {
    return await prisma.branch.findMany({
      include: {
        businessHours: true,
        branchDeliverySettings: true,
        managers: true,
      }
    });
  }

  async deleteBranch(input: DeleteBranchInput) {

    return await prisma.$transaction(async tx => {
      const existingBranch = await tx.branch.findUnique({
        where: { id: input.branchId, tenantId: input.tenantId }
      });



    if(!existingBranch) throw new ApiError(httpStatus.NOT_FOUND, "Branch not found");

    const deletedBranch = await tx.branch.update({
      where: {
        id: input.branchId,
        tenantId: input.tenantId
       },
       data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedById: input.userId
       }
    });

    return {
      isDeleted: true,
      deletedBranch: deletedBranch
      };

    });
  }


  // get all active branch
  async getAllActiveBranch() {
    return await prisma.branch.findMany({
      where: { isActive: true, isDeleted: false }
    });
  }
  
  // Continue with other methods...
}
