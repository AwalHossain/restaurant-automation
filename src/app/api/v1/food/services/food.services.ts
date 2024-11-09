import { DeviceType } from "@prisma/client";
import { prisma } from "../../../../../shared/prisma";
import { CreateFoodInput, UpdateFoodDetailsInput } from "../dtos/food.dto";



export class FoodService {
  
    async createFood(input: CreateFoodInput) {
      const createdFood = await prisma.$transaction(async (tx)=>{
        const food = await tx.food.create({ 
          data: {
            name: input.name,
            description: input.description,
            basePrice: input.basePrice,
            minOrderQuantity: input.minOrderQuantity,
            foodImages: {
              create: input.images.map((data)=>({
                url: data.url,
                deviceType: data.deviceType as DeviceType,
                width: data.width,
                height: data.height,
                size: data.size
              }))
            }
          }
        });
        return food;
      });
      return createdFood;
    }


    async updateFoodDetails(input: UpdateFoodDetailsInput) {
      console.log(input, 'input check');
      
      const updatedFood = await prisma.food.update({
        where: { id: input.id },
        data: {
          isPopular: input.isPopular,
          isRecommended: input.isRecommended,
          isNewArrival: input.isNewArrival,
          freeDelivery: input.freeDelivery,
          specialDeliveryFee: input.specialDeliveryFee,
          haveDiscount: input.haveDiscount,
          discountedPrice: input.discountedPrice,
          offer: input.offer,
          topSnacks: input.topSnacks,
          dynamicHome: input.dynamicHome,
          trending: input.trending,
          isFree: input.isFree,
          isFeatured: input.isFeatured,
          expiryDate: input.expiryDate,
          availableStartTime: input.availableStartTime,
          availableEndTime: input.availableEndTime,
          trendingStartTime: input.trendingStartTime,
          trendingEndTime: input.trendingEndTime,
          // handle relations
          variants:{
            set: input.foodVariantIds?.map((id)=>({id}))
          },
          ...(input.categoryIds && {
            categories:{
              set: input.categoryIds.map((id)=>({id}))
            }
          }),
          ...(input.branchIds && {
            branches:{
              set: input.branchIds.map((id)=>({id}))
            } 
          }),
          ...(input.campaignId && {
            campaign:{
              connect: {
                id: input.campaignId
              }
            }
          })
          
        },
        include: {
          foodImages: true,
          variants: true,
          categories: true,
          branches: true
        }
      }
    );
      return updatedFood;
    }


    async getAllFoods() {
      const foods = await prisma.food.findMany({
        include: {
          foodImages: true,
          variants: true,
          categories: true,
          branches: true
        }
      });
      return foods;
    } 
    
}
