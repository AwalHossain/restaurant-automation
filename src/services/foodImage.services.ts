// services/image.service.ts
import { DeviceType } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import env from '../config';
import { ImageSpecs } from '../types/food.types';
import { AddOnImageService } from './addonImage.service';


cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
});



export class ImageService {
  private readonly imageSpecs = {
    MOBILE: { width: 640, height: 360 },
    TABLET: { width: 1024, height: 576 },
    DESKTOP: { width: 1920, height: 1080 }
  };

  private addOnImageService: AddOnImageService;

  constructor () {
    this.addOnImageService = new AddOnImageService();
  }

  async uploadFoodImage(
    file: Express.Multer.File,
  ): Promise<ImageSpecs[]> {
   
   const images: ImageSpecs[] = [];

   const validation = await this.addOnImageService.validateImage(file);


  
   for(const [deviceType, specs] of Object.entries(this.imageSpecs)) {
        // 1. Optimize image with improved cropping
        const optimizedBuffer = await sharp(file.buffer)
        .resize(specs.width, specs.height, {
          fit: 'contain', // Change from 'cover' to 'contain'
          background: { r: 255, g: 255, b: 255, alpha: 1 }, // White background
          position: 'center',
          withoutEnlargement: true // Prevent upscaling
        })
        .webp({ 
          quality: 80,
          lossless: false,
          nearLossless: true
        })
        .toBuffer();

      console.log(optimizedBuffer, 'optimizedBuffer');
    // 2. Upload to Cloudinary
    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${optimizedBuffer.toString('base64')}`,
      {
        folder: 'food-images',
        resource_type: 'image'
      }
    );

    
    images.push({
      url: result.secure_url,
      width: specs.width,
      height: specs.height,
      size: result.bytes,
      deviceType: deviceType as DeviceType
    });
   }
    return images;
  }



}
