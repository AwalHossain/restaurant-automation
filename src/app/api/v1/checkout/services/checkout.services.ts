import { CheckoutStatus, OrderType, PointsTransactionType, PromotionType } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../../../../errors/ApiError";
import { prisma } from "../../../../../shared/prisma";
import { AddressService } from "../../address/services/address.service";
import { CalculateTotalsInput, CreateCheckoutInput, ValidatedCartItem } from "../dtos/checkout.dto";




export class CheckoutService {


  private readonly addressService: AddressService
  
  constructor(){
      this.addressService = new AddressService();
  }


  async preCheckout(input: CalculateTotalsInput, userId: string){
    const validatedItem = await this.validateCart(userId);

    // calculate initial totals
    const subtotal = await this.calculateTotal(validatedItem, input, userId);

    return subtotal;
  }


  async createCheckout(input: CreateCheckoutInput, userId: string){
   
   return await prisma.$transaction(async (tx)=>{


    // validate address
    if(input.orderType === OrderType.DELIVERY && input.addressId){
      const address = await this.addressService.validateAddressForCheckout(input.addressId, userId);
      if(!address) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid delivery address');
      }
    }

    const validatedItem = await this.validateCart(userId);
    // calculate total
    const {
      subtotal,
      deliveryFee,
      serviceCharge,
      tax,
      discount,
      pointsDiscount,
      earnablePoints,
      total,
      promotionId,
    } = await this.calculateTotal(validatedItem, input, userId)


    // create checkout
    const checkout = await tx.checkout.create({
      data: {
        userId,
        branchId: input.branchId,
        orderType: input.orderType,
        paymentMethod: input.paymentMethod!,
        subtotal,
        deliveryFee,
        serviceCharge,
        tax,
        discount,
        pointsDiscount,
        total,
        addressId: input.addressId,
        tableNumber: input.tableNumber,
        notes: input.notes,
        status: CheckoutStatus.PENDING,
        orderNumber: this.generateOrderNumber(userId),
        createdAt: new Date(),
        email: input.email,
        phoneNumber: input.phoneNumber,
        updatedAt: new Date(),
        items:{
          create: validatedItem.map((item)=>({
            variant: item.variantId ? {
              connect:{
                id: item.variantId
              }
            } : undefined,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            addonTotal: item.addonTotal,
            food: {
              connect:{
                id: item.foodId
              }
            },
            addons:{
              create: item.addons.map((addon)=>({
                quantity: addon.quantity,
                unitPrice: 0,
                addon:{
                  connect:{
                    id: addon.addonId
                  }
                }
              }))
            }
          }))
        }
      }
    })

    console.log(checkout,">>>> checkout");
    

       // Update promotion and points usage after successful checkout
       if (input.promoCode) {
        await this.updatePromotionUsage(promotionId, userId, checkout.id);
      }
       if (input.pointsToRedeem) {
        await this.updateUserPoints(
          userId,
          input?.restaurantId!,
          checkout.id,
          input.pointsToRedeem,
          earnablePoints ?? 0
        );
      }

    // clear cart
    
    return checkout;
  })
  }


  // get all checkout
  async getAllCheckouts(){
    return await prisma.checkout.findMany({
      include:{
        items: true,
        user: true,
        branch: true,
        address: true,
      }
    })
  }

  // get checkout by checkout id
  async getCheckoutByOrderId(id: string){
    console.log(id,">>>> id");
    const checkout = await prisma.checkout.findUnique({
      where:{
        orderNumber: id
      },
      include:{
        user: true,
        branch: true,
        address: true,
        items: {
          include:{
            food: true,
            variant: true,
            addons: {
              include:{
                addon: true,
              }
            }
          }
        },
      }
    })
    console.log(checkout,">>>> checkout");
    if(!checkout) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Checkout not found');
    }
  
    // handle legacy checkout
    if(!checkout.items || checkout.items.length === 0){
      return{
        ...checkout,
        isLegacyCheckout: true, 
        items:[]
      }
    }

    return checkout;
  }

  // get checkout by user id
  async getCheckoutByUserId(userId: string){
    return await prisma.checkout.findMany({
      where:{userId}
    })
  }


  private generateOrderNumber(userId: string){
    return `ORD-${userId}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`
  }

  // validate cart items
  async validateCart(userId: string) {
    const cart = await prisma.cart.findUnique({
      where: {
        userId
      },
      include:{
        items:{
          include:{
            food: true,
            variant: true,
            addons: {
              include:{
                addon: true,
              }
            }
          }
        }
      }
    })

    if(!cart || cart.items.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cart is empty');
    }

    const validatedItem:ValidatedCartItem[] = []

    for(const item of cart.items) {

        if(!item.food.isActive) {
          throw new ApiError(httpStatus.NOT_FOUND, 'Food not found');
        }
        // calculate addon total
        const addonTotal = item.addons.reduce((sum, addon)=>{
          if(!addon.addon.isActive) {
          throw new ApiError(httpStatus.NOT_FOUND, 'Addon not found');
          }
          return sum + (Number(addon.addon.price) * Number(addon.quantity))
        }, 0)


        // get unit price (either variant price or base price)
        const unitPrice = item.variant?.basePrice ?? item.food.basePrice;

        validatedItem.push({
          foodId: item.food.id,
          variantId: item.variant?.id ?? undefined,
          quantity: item.quantity,
          addons: item.addons.map((addon)=>({
            addonId: addon.addon.id,
            quantity: addon.quantity,
          })),
          unitPrice: Number(unitPrice),
          addonTotal: addonTotal,
          subtotal: (Number(unitPrice) + addonTotal) * Number(item.quantity),
        })



    }

    return validatedItem;
  }

  // calculate total
  private async calculateTotal(
    validatedItem: ValidatedCartItem[],
    input: CreateCheckoutInput,
    userId: string,
  ){
    const subtotal = validatedItem.reduce((sum, item)=> Number(sum) + Number(item.subtotal),0);

    // get branch settings
    const branch = await prisma.branch.findUnique({
      where:{id: input.branchId},
      include:{
        Restaurant:{
          include:{
            settings: true,
          }
        }
      }
    })

    if(!branch) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Branch not found');
    }

    const settings = branch.Restaurant?.settings;

    // Calculate delivery fee
    let deliveryFee = 0;
    if(input.orderType === OrderType.DELIVERY) {
      deliveryFee = settings?.baseDeliveryFee?.toNumber() ?? 0;
      // add Complex delivery fee calculation here
      // settings?.distanceBasedFees
    }

    // calculate service charge
    const serviceCharge = subtotal * (settings?.serviceChargePercentage?.toNumber() ?? 0) / 100;

    // calculate tax
    const tax = subtotal * (settings?.taxPercentage?.toNumber() ?? 0) / 100;

    // calculate promotional discount
    let discount: {promoDiscount: number, promotionId: string} = {promoDiscount: 0, promotionId: ''};
    if(input.promoCode){
      const {discount: promoDiscount, promotionId} = await this.calculatePromotionalDiscount(
        input.promoCode,
        subtotal,
        userId
      )
      discount = {promoDiscount, promotionId};
      // await this.updatePromotionUsage(promotionId, userId, checkoutId)
    }

    // Calculate points discount
    let pointsDiscount = 0;
    if(input.pointsToRedeem){
      pointsDiscount = await this.calculatePointsDiscount(
        input.pointsToRedeem,
        userId,
        branch.Restaurant?.id as string
      )
    }

    // calculate total
    const total = subtotal + deliveryFee + serviceCharge + tax - discount.promoDiscount - pointsDiscount;

    // calculate earnable points
    const earnablePoints = await this.calculateEarnablePoints(
      total,
      branch.Restaurant?.id as string
    )

    return {
       subtotal,
       deliveryFee,
       serviceCharge,
       tax,
       discount: discount.promoDiscount,
       pointsDiscount,
       earnablePoints,
       total,
       promotionId: discount.promotionId,
      };

  }

// calculate promotional discount
  private async calculatePromotionalDiscount(
    promoCode: string, 
    subtotal: number, 
    userId: string): Promise<{discount: number, promotionId: string}> {
      const promotion = await prisma.promotion.findUnique({
        where: {
          promoCode
        }
      })

      if(!promoCode || !promotion?.isActive || promotion.startDate > new Date() || promotion.endDate < new Date()) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Invalid promo code');
      }

      // check total redemption limit
      if(promotion.usageLimit && promotion.usedCount >= promotion.usageLimit ){
        throw new ApiError(httpStatus.BAD_REQUEST, 'Maximum usage limit reached');
      }


    // check the Minimum order amount
    if(promotion.minOrderAmount && subtotal < promotion.minOrderAmount.toNumber()) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Minimum order amount for this promotion is ${promotion.minOrderAmount.toNumber()}` );
    }

    // check usage limit
    const userUsage = await prisma.userPromotion.findUnique({
      where:{
        userId_promotionId:{
          userId,
          promotionId: promotion.id
        }
      }
    })

    if(promotion.maxUsagePerUser && userUsage && userUsage.usageCount >= promotion.maxUsagePerUser ) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Maximum usage limit reached');
    }

    let discount = 0;
    if(promotion.type === PromotionType.PERCENTAGE){
      discount = subtotal * (promotion.value.toNumber() / 100)
    }else{
      discount = promotion.value.toNumber()
    }

    // Apply max discount if specified
    if(promotion.maxDiscount && discount > promotion.maxDiscount.toNumber()) {
      discount = promotion.maxDiscount.toNumber()
    }


    return {discount, promotionId: promotion.id};
  }

  // update promotion usage
  private async updatePromotionUsage(
    promotionId: string,
    userId: string,
    checkoutId: string,
  ){

    await prisma.$transaction(async (tx)=>{
      await tx.promotion.update({
        where:{id: promotionId},
        data:{
          usedCount: {increment: 1},
          redemptionHistory:{
            push:{
              userId,
              checkoutId,
              usedAt: new Date(),
            }
          }
        },
      })
    })

    // update or create user promotion
    await prisma.userPromotion.upsert({
      where:{userId_promotionId:{userId, promotionId}},
      update:{
        usageCount: {increment: 1},
        lastUsedAt: new Date(),
      },
      create:{
        userId,
        promotionId,
        usageCount: 1,
        lastUsedAt: new Date(),
      }
    })

  }

// 
  private async calculateEarnablePoints(
    total: number,
    restaurantId: string,
  ){
    const pointsSystem = await prisma.pointsSystem.findUnique({
      where:{
        restaurantId
      }
    })

    if(!pointsSystem || !pointsSystem.isEnabled) {
      return 0;
    }

    if(pointsSystem.minSpendForPoints && total < pointsSystem.minSpendForPoints.toNumber()) {
      return 0;
    }


  }

  private async calculatePointsDiscount(
    pointsToRedeem: number,
    userId: string,
    restaurantId: string,
  ):Promise<number>{


    const userPoints = await prisma.userPoints.findUnique({
      where:{
       userId_restaurantId:{
        userId,
        restaurantId
       },
       
      },
      include:{
        pointsSystem: true
      }
    })

    console.log(userPoints,">>>> userPoints", pointsToRedeem, userPoints?.points );

    if(!userPoints || !userPoints.pointsSystem) {
      return 0;
    }

    if(pointsToRedeem > userPoints.points) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient points');
    }

    

    // check points expiry
    if(userPoints.pointsExpiryDate && userPoints.pointsExpiryDate < new Date()) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Points have expired');
    }

    // validate min and max points redeem
    if(userPoints.pointsSystem.minPointsRedeem > pointsToRedeem) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Minimum points to redeem is ${userPoints.pointsSystem.minPointsRedeem}`);
    }

    if(userPoints.pointsSystem.maxPointsRedeem && pointsToRedeem > userPoints.pointsSystem.maxPointsRedeem) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Maximum points to redeem is ${userPoints.pointsSystem.maxPointsRedeem}`);
    }
    

    return pointsToRedeem * userPoints.pointsSystem.redemptionRate.toNumber();
  }



  // update user points after successful checkout
  private async updateUserPoints (
    userId: string,
    restaurantId: string,
    checkoutId: string,
    pointsToRedeem: number,
    pointsEarned: number,
  ){

    await prisma.$transaction(async (tx)=>{

      const userPoints = await tx.userPoints.update({
        where:{
        userId_restaurantId:{
          userId,
          restaurantId
        }
      },
      data:{
        points: {
          decrement: pointsToRedeem
        },
        totalPointsRedeemed:{
          increment: pointsToRedeem
        },
        totalPointsEarned:{
          increment: pointsEarned
        },
        lastRedeemedAt: pointsToRedeem ? new Date() : undefined,
        lastEarnedAt: pointsEarned ? new Date() : undefined,
      }
      })

      // create points history
      if(pointsToRedeem > 0){
        await tx.pointsHistory.create({
          data:{
            userPointsId: userPoints.id,
            points: pointsToRedeem,
            type: PointsTransactionType.REDEEMED,
            orderId: checkoutId,
            description: `Redeemed ${pointsToRedeem} points for checkout`,
            createdAt: new Date(),
          }
        })
      }

    if(pointsEarned >0){
      await tx.pointsHistory.create({
        data:{
          userPointsId: userPoints.id,
          points: pointsEarned,
          type: PointsTransactionType.EARNED,
          orderId: checkoutId,
          description: `Earned ${pointsEarned} points for checkout`,
          createdAt: new Date(),
        }
      })
    }

    })
  }

  

}