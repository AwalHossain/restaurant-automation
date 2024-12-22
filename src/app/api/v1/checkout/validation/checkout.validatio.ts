import { OrderType, PaymentMethod } from "@prisma/client";
import { z } from "zod";


export const createCheckoutSchema = z.object({
    branchId: z.string().cuid(),
    orderType: z.nativeEnum(OrderType),
    paymentMethod: z.nativeEnum(PaymentMethod),
    promoCode: z.string().optional(),
    pointsToRedeem: z.number().min(0).optional(),
    addressId: z.string().optional(),
    notes: z.string().optional(),
    tableNumber: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().email().optional(),
}).refine((data) => {
    if(data.paymentMethod === PaymentMethod.CASH) {
        return data.addressId !== undefined;
    }

    if(data.paymentMethod === PaymentMethod.CARD) {
        return data.email !== undefined;
    }

    if(data.paymentMethod === PaymentMethod.MOBILE_BANKING) {
        return data.phoneNumber !== undefined;
    }

    if(data.paymentMethod === PaymentMethod.ONLINE) {
        return data.email !== undefined;
    }

  // validate adddress for delivery
  if(data.orderType === OrderType.DELIVERY && !data.addressId) {
    return false;
  }

  // validate adddress for dine in
  if(data.orderType === OrderType.DINE_IN && !data.tableNumber) {
    return false;
  }

    return true;
}, {
    message: 'Missing required fields',
})