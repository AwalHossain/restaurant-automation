// import { AuditLogAction, BranchStaffRole, NotificationType } from "@prisma/client";
// import httpStatus from "http-status";
// import ApiError from "../../../../../errors/ApiError";
// import { prisma } from "../../../../../shared/prisma";
// import { UpdateStaffDto } from "../dtos/restaurant-stuff.dto";




// export class RestaurantStuffService {


//     // get all staffs
//     async getAllStaffs(tenantId: string) {
//         const staffs = await prisma.restaurantStaff.findMany({
//             where: {
//                 tenantId: tenantId
//             }
//         });
//         return staffs;
//     }

//     async updateStaff(data: UpdateStaffDto) {
//         return await prisma.$transaction(async (tx)=>{
//             // check if the user is already a staff of the restaurant
//             const existingStaff = await tx.restaurantStaff.findFirst({
//                 where: {
//                     userId: data.userId,
//                     restaurantId: data.restaurantId,
//                 }
//             })

//             if (!existingStaff) {
//                 // then update the staff
//                 throw new ApiError(httpStatus.NOT_FOUND, "Staff not found");
//             }

//             // update the staff
//             const updatedStaff = await tx.restaurantStaff.update({
//                 where: {
//                     id: existingStaff.id
//                 },
//                 data: {
//                     role: data.role,
//                     isActive: data.isActive,
//                 }
//             })

//             // update the branch assignment if the branchIds is provided
//             if(data.branchIds){
//                 await tx.branchStaff.deleteMany({
//                     where: {
//                         userId: existingStaff.userId
//                     }
//                 })

//                 // create new branch assignment
//                 await tx.branchStaff.createMany({
//                     data: data.branchIds.map((branchId) => ({
//                         userId: existingStaff.userId,
//                         branchId: branchId,
//                         role: data.role as BranchStaffRole,
//                         isActive: data.isActive ?? existingStaff.isActive,
//                         tenantId: existingStaff.tenantId,
//                     }))
//                 })
//             }

//             // create Notification
//             await tx.notification.create({
//                 data: {
//                     userId: existingStaff.userId,
//                     message: `You've assigned to ${data.role} role in the restaurant`,
//                     type: NotificationType.STAFF_STATUS,
//                     title: "Staff Status Updated",
//                     tenantId: existingStaff.tenantId,
//                     data:{
//                         role: data.role,
//                         staffId: existingStaff.id,
//                     }
//                 }
//             })

//             // create audit log
//             await tx.auditLog.create({
//                 data: {
//                     userId: existingStaff.userId,
//                     action: AuditLogAction.UPDATE,
//                     tenantId: existingStaff.tenantId,
//                     entityType: "RESTAURANT_STAFF",
//                     entityId: existingStaff.id,
//                     newData: updatedStaff,
//                     oldData: existingStaff,
//                     ipAddress: data.ipAddress,
//                     userAgent: data.userAgent,
//                 }
//             })
//         })
//     }
// }

