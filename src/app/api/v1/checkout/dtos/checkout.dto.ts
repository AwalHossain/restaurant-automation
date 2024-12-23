import { OrderType, PaymentMethod } from '@prisma/client'

export interface CreateCheckoutInput {
  branchId: string
  orderType: OrderType
  paymentMethod?: PaymentMethod
  promoCode?: string
  pointsToRedeem?: number
  addressId?: string
  tableNumber?: string
  notes?: string
  phoneNumber?: string
  restaurantId?: string
  email?: string
}

export interface CheckoutCalculation {
  subtotal: number
  deliveryFee: number
  serviceCharge: number
  tax: number
  discount: number
  pointsDiscount: number
  total: number
  earnablePoints?: number
}

export interface ValidatedCartItem {
  foodId: string
  variantId?: string
  quantity: number
  addons: {
    addonId: string
    quantity: number
  }[]
  unitPrice: number
  addonTotal: number
  subtotal: number
}

export interface CalculateTotalsInput {
  branchId: string;
  orderType: OrderType;
  addressId?: string;
  promoCode?: string;
  pointsToRedeem?: number;
}
 export interface CalculatedTotals {
  subtotal: number;
  deliveryFee: number;
  serviceCharge: number;
  tax: number;
  promoDiscount: number;
  pointsDiscount: number;
  total: number;
  earnablePoints: number;
  isValidPromoCode: boolean;
  isValidPoints: boolean;
  error?: {
    promoCode?: string;
    points?: string;
  };
 
}
