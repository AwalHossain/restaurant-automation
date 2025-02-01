import { Prisma } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../../../../errors/ApiError";

export async function validateCircularInheritance(tx: Prisma.TransactionClient, inheritedFromId: string) {
    if (!inheritedFromId) return;

    const visitedRoles = new Set<string>();
    let currentRoleId = inheritedFromId;

    try {
        while(currentRoleId) {
            if (visitedRoles.has(currentRoleId)) {
                throw new ApiError(
                    httpStatus.BAD_REQUEST, 
                    `Circular inheritance detected: Role chain loops back to ${currentRoleId}`
                );
            }
            visitedRoles.add(currentRoleId);
            const parentRole = await tx.userRole.findUnique({
                where: { id: currentRoleId },
                select: { inheritedFromId: true, name: true }
            });
            if (!parentRole) {
                throw new ApiError(
                    httpStatus.BAD_REQUEST, 
                    `Invalid inheritance: Role ${currentRoleId} not found`
                );
            }
            currentRoleId = parentRole.inheritedFromId || "";
        }
    } finally {
        visitedRoles.clear(); // Explicitly clear the Set
    }
}