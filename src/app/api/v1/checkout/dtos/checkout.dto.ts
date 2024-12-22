import { OrderType, PaymentMethod } from '@prisma/client'

export interface CreateCheckoutInput {
  branchId: string
  orderType: OrderType
  paymentMethod: PaymentMethod
  promoCode?: string
  pointsToRedeem?: number
  addressId?: string
  tableNumber?: string
  notes?: string
  phoneNumber?: string
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