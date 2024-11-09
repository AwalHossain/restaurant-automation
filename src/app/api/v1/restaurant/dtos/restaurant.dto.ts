
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
    ratings?: number;
    deliveryAreas?: string[];
    openDate?: Date;
    featured?: boolean;
    restaurantSettings: RestaurantSettings;
}

type RestaurantSettings = {
    currency: string;
    currencySymbol?: string;
    timezone?: string;
    orderNumberPrefix?: string;
    minOrderAmount?: number;
    maxOrderAmount?: number;
    deliveryFee?: number;
    taxPercentage?: number;
    paymentMethods?: string[];
    deliveryTimeEstimate?: number;
    customerSupportEmail?: string;
    restaurantType?: RestaurantType;
    serviceChargePercentage?: number;
    acceptsPreorders?: boolean;
    autoAssignRiders?: boolean;
    smsNotifications?: boolean;
    emailNotifications?: boolean;
    errorNotificationEmail?: string;
    notifyOnCriticalErrors?: boolean;
    autoResponseEnabled?: boolean;
    feedbackResponseDelay?: number;
    timezoneOffset?: number;
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

}

type BusinessHours = {
    dayOfWeek: number;
    openingTime: string;
    closingTime: string;
    isClosed: boolean;
}
