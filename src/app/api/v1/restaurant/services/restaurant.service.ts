import { prisma } from "../../../../../shared/prisma";
import { CreateBranchInput, CreateRestaurantInput } from "../dtos/restaurant.dto";




export class RestaurantService {

  async  createRestaurant(input: CreateRestaurantInput) {
        const result = await prisma.restaurant.create({
            data: {
                ...input
            },
            include: {
                RestaurantSettings: true
            }
        });
        return result;
    }

    async getRestaurantByDomain(domain: string) {
        const result = await prisma.restaurant.findUnique({
            where: { domain },
            include: {
                branches: true
            }
        });
        return result;
    }

    async getAllRestaurants() {
        const result = await prisma.restaurant.findMany({
            include: {
                branches: true
            }
        });
        return result;
    }


    async createBranch(input: CreateBranchInput) {
        const result = await prisma.branch.create({
            data: {
                ...input
            }
        })
        return result;
    }


    async getAllBranches(restaurantId: string) {
        const result = await prisma.branch.findMany({
            where:{
                restaurantId
            }
        });
        return result;
    }

    async getBranchById(id: string) {
        const result = await prisma.branch.findUnique({
            where: { id }
        });
        return result;
    }
}


