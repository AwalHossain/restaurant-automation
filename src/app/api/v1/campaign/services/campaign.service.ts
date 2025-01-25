import { prisma } from "../../../../../shared/prisma";
import { CampaignDto } from "../dtos/campaign.dto";



export class CampaignService {

    async createCampaign(input: CampaignDto) {
        const {images, ...rest} = input;
        const result = await prisma.campaign.create({
            data: {...rest, 
                tenantId:input.tenantId,
                images:{
                    create: images.map((image)=>({
                        url: image.url,
                        deviceType: image.deviceType,
                        width: image.width,
                        height: image.height,
                        size: image.size
                    }))
                }
            },
            include:{
                images: true
            }
        },
    );
        console.log(result, "result created");
        
        return result;
    }

    async updateCampaign(id: string, input: CampaignDto) {
        const {images, ...rest} = input;
        const result = await prisma.campaign.update({
            where: { id },
            data: { 
                ...rest,
                images:{
                    create: images.map((image)=>({
                        url: image.url,
                        deviceType: image.deviceType,
                        width: image.width,
                        height: image.height,
                        size: image.size
                    }))
                }
            }
        })
        return result;
    }

    async deleteCampaign(id: string) {
        const result = await prisma.campaign.delete({
            where: { id }
        })
        return result;
    }

    async getCampaign(id: string) {
        const result = await prisma.campaign.findUnique({
            where: { id },
            include: {
                images: true,
                foods: true
            }
        })
        return result;
    }

    async getAllCampaigns() {
        const result = await prisma.campaign.findMany({
            include: {
                images: true,
                foods: true
            }
        });
        return result;
    }
}
