import { Request } from "express";




export type CreateBranchInput = {

    name: string;
    description?: string;
    address: string;
    phoneNumber: string;
    email: string;
    latitude: string;
    longitude: string;
    deliveryRadius: number;
    isDeliveryAvailable?: boolean;
    isTakeawayAvailable?: boolean;
    isDineInAvailable?: boolean;
    restaurantId: string;
    businessHours: BusinessHours[];
    branchDeliverySettings: BranchDeliverySettings;

}

type BusinessHours = {
    dayOfWeek: number;
    openingTime: string;
    closingTime: string;
    isClosed: boolean;
    orderReceivingStart?: string;
    orderReceivingEnd?: string;
    temporaryClose?: boolean;
    temporaryCloseStart?: string;
    temporaryCloseEnd?: string;
    temporaryCloseReasonMessage?: string;
}
 
export type BranchDeliverySettings = {
    baseDeliveryFee?: number;
    deliveryZones?: Zone[];
    distanceBasedFees?: DistanceBasedFees[];
    maxDeliveryRadius?: number;
}



type DistanceBasedFees = {
    baseFee: number;
    perKmCharge: number;
    ranges: DistanceRange[];
}

type DistanceRange = {
    minKm: number;
    maxKm: number;
    fee: number;
    // estimated time based on the distance
    estimatedTime: {
        minMinutes: number;
        maxMinutes: number;
    }
}

type ZoneBasedFees = {
    zones: Zone[];
}

type Zone = {
    name: string;
    fee: number;
    estimatedTime: {
        minMinutes: number;
        maxMinutes: number;
    }
}

export type RestaurantType = "FAST_FOOD" | "FINE_DINING" | "CAFE";


export type UpdateBranchStatusInput = {
    branchId: string;
    userId: string;
    req: Request;
}

export type DeleteBranchInput = {
    branchId: string;
    tenantId: string;
    userId: string;
    req: Request;
}

