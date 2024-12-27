import ApiError from "../../../../../errors/ApiError";
import { prisma } from "../../../../../shared/prisma";
import { AddToCartInput } from "../dtos/cart.dto";



export class CartService {

  // add to cart
      async addToCart(input: AddToCartInput, userId: string) {
          return await prisma.$transaction(async (tx) => {
            // get or create cart
            let cart = await tx.cart.findUnique({
                where: {
                   userId_branchId:{
                    userId,
                    branchId: input.branchId
                   }
                },
            })

            if (!cart) {
                cart = await tx.cart.create({
                    data: {
                        userId,
                        branchId: input.branchId
                    }
                })
            }

            // check if simillar item is already in cart
            const existingItem = await tx.cartItem.findFirst({
                where: {
                    cartId: cart.id,
                    foodId: input.foodId,
                    variantId: input.variantId || null,
                    addons:{
                      every:{
                        addonId: {
                          in: input.addons?.map(addon => addon.addonId) || []
                      }
                    }
                }
              }
            })

            if (existingItem) {
              // update the quantity
             return await tx.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + input.quantity },
                include: {
                  food: true,
                  variant: true,
                  addons: {
                    include: {
                      addon: true
                    }
                  }
                }
              })
            }

            // create new cart item
            return await tx.cartItem.create({
              data: {
                cartId: cart.id,
                foodId: input.foodId,
                variantId: input.variantId || null,
                addons: input.addons ? {
                  createMany: {
                    data: input.addons.map(addon => ({
                      addonId: addon.addonId,
                      quantity: addon.quantity
                    }))
                  }
                } : undefined,
                quantity: input.quantity,
              },
              include: {
                food: true,
                variant: true,
                addons: {
                  include: {
                    addon: true
                  }
                }
              }
            })
          })
      }

      // get cart with calculated total
      async getCart(userId: string) {
        const cart = await prisma.cart.findUnique({
          where: { userId },
          include: {
            items:{
              include:{
                food: true,
                variant: true,
                addons: {
                  include: {
                    addon: true
                  }
                }
              }
            },
            branch: true,
            user: true,
          },
        })

        if (!cart) {
          throw new ApiError(404, "Cart not found");
        }

        // calculate total for each item and cart
        const itemsWithTotals = cart.items.map(item=>{
          const variantPrice = item?.variant?.basePrice ??item?.food?.basePrice;
          const addonsTotal = item.addons.reduce((acc, addon) => acc + Number(addon.addon.price) * addon.quantity, 0);
          const itemTotal = (Number(variantPrice) + addonsTotal) * item.quantity;
          return{
            ...item,
            itemTotal
          } ;
        })

        const cartTotal = itemsWithTotals.reduce((acc, item) => acc + item.itemTotal, 0);

        return {
          ...cart,
          items: itemsWithTotals,
          total: cartTotal
        }
      }


      // update cart item quantity
      async updateCartItemQuantity(data: {cartItemId: string, quantity: number, addons: any}, userId: string) {
        // verify cart item belongs to user
        const cartItem = await prisma.cartItem.findUnique({
          where: { id: data.cartItemId, cart: { 
            userId: userId,
           } 
          },
        })

        console.log(cartItem,"cartItem", data.cartItemId);
        

        if (!cartItem) {
          return {
            items: [],
            total: 0
          }
        }

        console.log(data,"data");
        

        return await prisma.$transaction(async (tx) => {
          // update cart item quantity
          const updatedCartItem = await tx.cartItem.update({
            where: { id: data.cartItemId },
            data: { 
              quantity: data.quantity,
              addons: {
                deleteMany: {},
                createMany: {
                  data: data.addons.map((addon: any) => ({
                    addonId: addon.addonId,
                    quantity: addon.quantity
                  }))
                }
              }
             },
            include: {
              food: true,
              variant: true,
              addons: {
                include: {
                  addon: true
                }
              }
            },
          })
          

          // recalculate cart total
          const cart = await this.getCart(userId)
          return {
            ...cart,
            items: updatedCartItem
          }
        })
      }


      // remove cart item
      async removeCartItem(cartItemId: string, userId: string) {
        // verify cart item belongs to user
        const cartItem = await prisma.cartItem.findUnique({
          where: { id: cartItemId, cart: { userId } },
        })

        if (!cartItem) {
          return new ApiError(404, "Cart item not found")
        }

        return await prisma.cartItem.delete({
          where: { id: cartItemId, cart: { userId } },
        })
      }

      // clear cart
      async clearCart(userId: string) {
        return await prisma.cart.delete({
          where: { userId },
        })
      }
}
