import { AuditLogAction, BranchStaffRole, Role } from "@prisma/client";
import httpStatus from "http-status";
import { z } from "zod";
import ApiError from "../../../../../errors/ApiError";
import { getPermissions } from "../../../../../helpers/getPermission";
import { prisma } from "../../../../../shared/prisma";
import { userSelect } from "../../../../../types/food.types";
import { AddStaffDto, permissionsDto, UpdateStaffRoleDto } from "../dtos/branch-staff.dto";


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
        const existingStaff = await prisma.branchStaff.findUnique({
            where: {
                userId_branchId:{
                    userId: user.id,
                    branchId: branch.id
                }
                
            }
        })

        console.log(existingStaff, "existingStaff")

        if (existingStaff) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'User is already a staff of this branch', 'USER_ALREADY_STAFF');
        }

        const branchStaff = await prisma.branchStaff.create({
            data: {
                userId: user.id,
                branchId: branch.id,
                tenantId: branch.tenantId,
                role: input.role as BranchStaffRole,
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
                tenantId: branch.tenantId
            }
        })

        return branchStaff;
    }

    async removeStaffFromBranch(branchId: string, userId: string) {
        console.log(branchId, userId, "branchId, userId")
        const branchStaff = await prisma.branchStaff.findFirst({
            where: {
                branchId,
                userId
            }
        })

        console.log(branchStaff, "branchStaff")

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
    async updateStaffRole(input: UpdateStaffRoleDto) {
        console.log(input, "input")
        try {
            const result = await prisma.$transaction(async (tx)=>{
                // lock the record for update

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

                console.log(user, "user",branch)

                const existingStaff = await prisma.branchStaff.findUnique({
                    where: {
                        userId_branchId:{
                            userId: user?.id!,
                            branchId: branch.id
                        }
                        
                    }
                })
                console.log(existingStaff, "existingStaff")
                if(!existingStaff){
                    throw new ApiError(httpStatus.BAD_REQUEST, 'STAFF_NOT_FOUND');
                }
                // update the record
               const updatedStaff = await tx.branchStaff.update({
                    where: { id: existingStaff.id },
                    data: { role: input.role as BranchStaffRole, isActive: input.isActive ?? true }
                })

                // log the staff updated
                await tx.auditLog.create({
                    data: {
                        action: AuditLogAction.UPDATE,
                        tenantId: branch.tenantId,
                        userId: existingStaff.userId,
                        entityId: existingStaff.id,
                        entityType: "BRANCH_STAFF",
                        newData: updatedStaff,
                    }
                })

                return updatedStaff;

            })
            return result;
        } catch (error) {
            console.log(error, "error")
            throw new ApiError(httpStatus.BAD_REQUEST, 'STAFF_NOT_FOUND');
        }
    }

    async getAvailableStaffByBranchId(branchId: string) {
        console.log(branchId, "branchId")
        const branchStaff = await prisma.branchStaff.findMany({
            where: { branchId, isActive: true },
            include: {
                user: userSelect as any
            }
        });

        return branchStaff;
    }

    // get branch staff by id
    async getBranchStaffById(branchId: string, staffId: string) {
        const branchStaff = await prisma.branchStaff.findFirst({
            where: { branchId, userId: staffId },
            include: {
                user: userSelect as any
            }
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

        console.log(userWithPermissions, "userWithPermissions")
    
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

        return permissions;
    }

}