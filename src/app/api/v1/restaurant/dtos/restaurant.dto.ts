
// model Restaurant {
//     id                 String              @id @default(cuid())
//     name               String
//     domain             String              @unique
//     logo               String?
//     address            String?
//     description        String?
//     socialMediaLinks   Json?
//     ratings            Decimal?            @db.Decimal(3, 2) // Average rating
//     deliveryAreas      Json? // Delivery zones (geospatial data)
//     openDate           DateTime?
//     featured           Boolean             @default(false)
//     branches           Branch[]
//     isActive           Boolean             @default(true)
//     createdAt          DateTime            @default(now())
//     updatedAt          DateTime            @updatedAt
//     RestaurantSettings RestaurantSettings?
//   }

import { DeliveryFeeType } from "@prisma/client";

  
//   model RestaurantSettings {
//     id                      String          @id @default(cuid())
//     restaurantId            String          @unique
//     restaurant              Restaurant      @relation(fields: [restaurantId], references: [id])
//     currency                String          @default("BDT")
//     currencySymbol          String? // Currency symbol
//     timezone                String          @default("Asia/Dhaka")
//     orderNumberPrefix       String?
//     minOrderAmount          Decimal?        @db.Decimal(10, 2)
//     maxOrderAmount          Decimal?        @db.Decimal(10, 2)
//     deliveryFee             Decimal?        @db.Decimal(10, 2)
//     taxPercentage           Decimal?        @db.Decimal(10, 2)
//     paymentMethods          Json? // List of supported payment methods
//     deliveryTimeEstimate    Int? // Estimated delivery time in minutes
//     customerSupportEmail    String?
//     restaurantType          restaurantType? // E.g., "Fast Food", "Fine Dining"
//     serviceChargePercentage Decimal?        @db.Decimal(5, 2)
//     acceptsPreorders        Boolean         @default(false)
//     autoAssignRiders        Boolean         @default(false)
//     smsNotifications        Boolean         @default(true)
//     emailNotifications      Boolean         @default(true)
//     errorNotificationEmail  String?
//     notifyOnCriticalErrors  Boolean         @default(true)
//     autoResponseEnabled     Boolean         @default(false)
//     feedbackResponseDelay   Int             @default(24) // hours
//     lastUpdatedBy           User?           @relation("RestaurantSettingsUpdater", fields: [lastUpdatedById], references: [id])
//     lastUpdatedById         String?
//     timezoneOffset          Int? // Numeric offset for timezone
//     updatedAt               DateTime        @updatedAt
//   }
export type CreateRestaurantInput = {
    name: string;
        domain: string;
        restaurantType:   RestaurantType  ;
        address: string;
        latitude: string;
        longitude: string;
        phoneNumber: string;
        email: string;
        logo?: string;
        description?: string;
        socialMediaLinks?: string[];
        isActive?: boolean;
    ratings?: number;
    openDate?: Date;
    featured?: boolean;
    settings?: RestaurantSettings;
    pointsSystem?: PointSystemInput;
}


type RestaurantSettings = {
    currency: string;
    currencySymbol?: string;
    timezone?: string;
    baseDeliveryFee?: number;
    deliveryFeeCalculationType?: DeliveryFeeType;
    distanceBasedFees?: DistanceBasedFees[];
    zoneBasedFees?: ZoneBasedFees[];
    minOrderAmount?: number;
    maxOrderAmount?: number;
    taxPercentage?: number;
    serviceChargePercentage?: number;

    allowGuestCheckout?: boolean;
    requirePhoneNumber?: boolean;
    requireEmail?: boolean;
    takeoutEnabled?: boolean;
    takeoutServiceCharge?: number;
    dineInEnabled?: boolean;
    dineInServiceCharge?: number;

    // Messages
    globalMessage?: string;
    globalMessageEnabled?: boolean;


    customerSupportEmail?: string;
    restaurantType?: RestaurantType;
    acceptsPreorders?: boolean;
    autoAssignRiders?: boolean;
    smsNotifications?: boolean;
    emailNotifications?: boolean;
    errorNotificationEmail?: string;
    notifyOnCriticalErrors?: boolean;
    autoResponseEnabled?: boolean;
    feedbackResponseDelay?: number;
    timezoneOffset?: number;

    lastUpdatedBy?: string;
    lastUpdatedById?: string;
    updatedAt?: Date;
}

// type for PointSystem
export type PointSystemInput = {
    isEnabled: boolean;
    pointsRate: number;      // e.g., 1 point per 100 BDT
    redemptionRate: number;  // e.g., 0.50 BDT per point
    minPointsRedeem: number; // e.g., 100 points minimum
    maxPointsRedeem?: number; // e.g., 1000 points maximum
    minSpendForPoints: number; // e.g., 500 BDT minimum spend
    pointsExpiryDays?: number;
    pointsExpiryType: "DAYS" | "MONTHS";
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


// "name": "Downtown Branch",
//   "address": "123 Main St, Cityville",
//   "phoneNumber": "+123456789",
//   "email": "contact@downtownbranch.com",
//   "latitude": "40.7128",
//   "longitude": "-74.0060",
//   "deliveryRadius": 5.0,
//   "isDeliveryAvailable": true,
//   "isTakeawayAvailable": true,
//   "isDineInAvailable": true,
//   "restaurantId": "restaurant123"

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