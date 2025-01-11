import { AuditLogAction, Role } from "@prisma/client";
import httpStatus from "http-status";
import { z } from "zod";
import ApiError from "../../../../../errors/ApiError";
import { getPermissions } from "../../../../../helpers/getPermission";
import { prisma } from "../../../../../shared/prisma";
import { AddStaffDto, permissionsDto, UpdateStaffDto } from "../dtos/branch-staff.dto";



export class BranchStaffService {

    async addStaffToBranch(input: AddStaffDto) {
        const branch = await prisma.branch.findUnique({
            where: {
                id: input.branchId
            }
        })

        if (!branch) {
            throw new Error('Branch not found');
        }

        const user = await prisma.user.findUnique({
            where: {
                id: input.userId
            }
        })

        if (!user || !user.isActive) {
            throw new Error('User not found');
        }

        // check if user is already a staff of the branch
        const existingStaff = await prisma.branchStaff.findFirst({
            where: {
                userId: user.id,
                branchId: branch.id
            }
        })

        if (existingStaff) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'User is already a staff of this branch', 'USER_ALREADY_STAFF');
        }

        const branchStaff = await prisma.branchStaff.create({
            data: {
                userId: user.id,
                branchId: branch.id,
                role: input.role,
                isActive: input.isActive ?? true
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        username: true,
                        fullName: true,
                        email: true,
                        phone: true,
                        image: true,
                    }
                },
                branch: true
            }
        })

        // log the staff added to the branch
        await prisma.auditLog.create({
            data: {
                action: AuditLogAction.CREATE,
                userId: user.id,
                entityId: branchStaff.id,
                entityType: "BRANCH_STAFF",
                newData: branchStaff,
            }
        })

        return branchStaff;
    }

    async removeStaffFromBranch(branchId: string, staffId: string) {
        const branchStaff = await prisma.branchStaff.findFirst({
            where: {
                branchId,
                userId: staffId
            }
        })

        if (!branchStaff) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'STAFF_NOT_FOUND');
        }

        await prisma.branchStaff.delete({
            where: {
                id: branchStaff.id
            }
        })
    }

    // update concurrent staff role
    async updateStaffRole(input: UpdateStaffDto) {

        try {
            const result = await prisma.$transaction(async (tx)=>{
                // lock the record for update
                const currentStaff = await tx.branchStaff.findUnique({
                    where:{
                        userId_branchId:{
                            branchId: input.branchId!,
                            userId: input.userId!
                        }
                    },
                })
                if(!currentStaff){
                    throw new ApiError(httpStatus.BAD_REQUEST, 'STAFF_NOT_FOUND');
                }
                // update the record
              return await tx.branchStaff.update({
                    where: { id: currentStaff.id },
                    data: { role: input.role, isActive: input.isActive ?? true }
                })
            })
            return result;
        } catch (error) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'STAFF_NOT_FOUND');
        }
    }

    async getAvailableStaffByBranchId(branchId: string) {
        const branchStaff = await prisma.branchStaff.findMany({
            where: { branchId, isActive: true },
            include: { user: true }
        })
        return branchStaff;
    }

    // get branch staff by id
    async getBranchStaffById(branchId: string, staffId: string) {
        const branchStaff = await prisma.branchStaff.findFirst({
            where: { branchId, userId: staffId },
            include: { user: true }
        })

        if (!branchStaff) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'STAFF_NOT_FOUND');
        }

        return branchStaff;
    }



    // get user permission
    async getBranchStaffPermissions(userId: string) {
        const userWithPermissions = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select:{
                role: true,
                branchStaff:{
                    select:{
                        branchId: true,
                        role: true,
                        branch:{
                            select:{
                                name: true
                            }
                        }
                    }
                }

            }
        })
    
        // create a permission map for frontend use
        const permissions = {
            globalRole: userWithPermissions?.role,
            branchRoles: userWithPermissions?.branchStaff.reduce((acc: Record<string,{
                role: Role,
                branchName: string,
                permissions: z.infer<typeof permissionsDto>
            }>, staff)=>{
             acc[staff.branchId] = {
                role: staff.role,
                branchName: staff.branch.name,
                permissions: getPermissions(staff.role)
             }

             return acc
            }, {})
         
        }
    }

}