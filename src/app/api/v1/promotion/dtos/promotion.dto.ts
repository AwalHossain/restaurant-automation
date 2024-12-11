export interface CreatePromotionDto {
  promoCode: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrder?: number;
  maxDiscount?: number;
  startDate: Date;
  endDate: Date;
  description?: string;
  terms?: string;
  userType?: "ALL" | "NEW_USER" | "EXISTING_USER" | "VIP";
  maxUsagePerUser?: number;
  usageLimit?: number;
  applicableItems?: any;
  excludedItems?: any;
  priority?: number;
  branchId?: string;
  foods?: string[];
  images?: {
    url: string;
    deviceType: "MOBILE" | "TABLET" | "DESKTOP";
    width: number;
    height: number;
    size: number;
  }[];
}
