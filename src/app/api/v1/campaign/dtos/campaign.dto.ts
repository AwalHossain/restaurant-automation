import { DeviceType } from "@prisma/client";


// dto for campaign
// model Campaign {
//     id                   String          @id @default(cuid())
//    name                 String
//    description          String?
//    startDate            DateTime
//    endDate              DateTime
//    isActive             Boolean         @default(true)
//    type                 CampaignType
//    discountPercentage   Decimal?        @db.Decimal(5, 2)
//    images               CampaignImage[]
//    priority             Int             @default(0)
//    targetAudience       Json?           // Audience targeting info
//    budget               Decimal?        @db.Decimal(10, 2)
//    displayLocation      String?         // Location on the site (e.g., homepage, menu page)
//    redemptionLimit      Int?            // Maximum redemptions allowed
//    conditions           Json?           // Campaign-specific rules (e.g., "minOrderAmount": 20)
//    promoCode            String?         // Promo code for the campaign
//    createdAt            DateTime        @default(now())
//    updatedAt            DateTime        @updatedAt
//    foods              Food[]
//  }

import { CampaignType } from "@prisma/client";
import { ImageSpecs } from "../../../../../types/food.types";

 
//  model CampaignImage {
//    id         String     @id @default(cuid())
//    campaignId String
//    campaign   Campaign   @relation(fields: [campaignId], references: [id])
//    url        String
//    deviceType DeviceType
//  }

export type CampaignImageDto = {
    url: string;
    width: number;
    height: number;
    size: number;
    deviceType: DeviceType;
}

export type TargetAudienceDto = {
    [key: string]: any;
}

export type ConditionsDto = {
    [key: string]: any;
}

export type CampaignDto = {
    name: string;
    tenantId: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    type: CampaignType;
    discountPercentage?: number;
    priority: number;
    targetAudience?: TargetAudienceDto;
    budget?: number;
    displayLocation?: string;
    redemptionLimit?: number;
    conditions?: ConditionsDto;
    promoCode?: string;
    images: ImageSpecs[];
}

export type UpdateCampaignDto = CampaignDto & {
    id: string;
}
