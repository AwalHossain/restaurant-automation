import { prisma } from "../../../../../shared/prisma";
import { CreateFoodInput } from "../dtos/food.dto";
import { FoodValidationService } from "../validation/food-validation.service";



export class FoodService {
  private readonly foodValidationService: FoodValidationService;
  constructor () {
    this.foodValidationService = new FoodValidationService();
  }
  
  async createFood(input: CreateFoodInput) {
    // Validate input
    await this.foodValidationService.validateCreateFoodInput(input);

    // Create food with all related data in a transaction
    const createdFood = await prisma.$transaction(async (tx) => {
      // Create the food
      const food = await tx.food.create({
        data: {
          name: input.name,
          description: input.description,
          basePrice: input.basePrice,
          minOrderQuantity: input.minOrderQuantity,
          createdById: input.createdBy,
          
          // Create food images
          foodImages: {
            create: input.images.map((image) => ({
              url: image.url,
              deviceType: image.deviceType,
              width: image.width,
              height: image.height,
              size: image.size
            }))
          },

          // Connect categories
          categories: {
            connect: input?.categoryIds?.map(id => ({ id }))
          },

          // Create variants if present
          ...(input.variants && {
            variants: {
              create: input.variants.map(variant => ({
                name: variant.name,
                basePrice: variant.basePrice,
                isActive: variant.isActive ?? true
              }))
            }
          })
        }
      });

      // Create addon groups and their relationships if present
      if (input.addonGroups?.length) {
        for (const group of input.addonGroups) {
          // Create FoodAddon relationships with group information
          await Promise.all(group.addons.map(addon=>
            tx.foodAddon.create({
              data: {
                foodId: food.id,
                addonId: addon.addonId,
                isRequired: addon.isRequired ?? false,
                maxQuantity: addon.maxQuantity ?? 1,
                // store group information in metadata or additional fields
                minQuantity: addon.minQuantity ?? 1,
                defaultQuantity: addon.defaultQuantity ?? 1,
                displayOrder: addon.displayOrder ?? 0,
                addonGroupId: group.id
              }
            })
          ))
        }
      }

      return food;
    });
    return createdFood;
  }




    async updateFoodDetails(input: CreateFoodInput) {
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

    async getFoodById(id: string) {
      const food = await prisma.food.findUnique({
        where: { id },
        include: {
          foodImages: true,
          variants: true,
          categories: true,
          branches: true,
          campaign: true,
          addons: true,
        }
      });
      return food;
    }
    
}
