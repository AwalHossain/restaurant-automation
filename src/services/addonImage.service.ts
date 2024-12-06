// services/image.service.ts
import { v2 as cloudinary } from 'cloudinary';
import httpStatus from 'http-status';
import sharp from 'sharp';
import { AddOnValidationService } from '../app/api/v1/food/validation/addon-validation.service';
import env from '../config';
import ApiError from '../errors/ApiError';
import { AddonImageSpecs } from '../types/food.types';


cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
});



export class AddOnImageService {
  private readonly imageSpecs = {
    width: 400,
    height: 400,
    maxSize: 4 * 1024 * 1024
  };

  private readonly addOnValidationService: AddOnValidationService

  constructor () {
    this.addOnValidationService = new AddOnValidationService();
  }

  async uploadFoodImage(
    file: Express.Multer.File,
  ): Promise<AddonImageSpecs> {

    try {
        await this.validateImage(file);

        const optimizedBuffer = await this.optimizeImage(file);
    
        const result = await this.uploadImageToCloudinary(optimizedBuffer);
       
       return {
        imageUrl: result.secure_url,
        imageSize: result.bytes
       }
    } catch (error) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid image format or size');
    }
  }

   async validateImage(file: Express.Multer.File): Promise<void> {
    // Check file size
    if (file.size > this.imageSpecs.maxSize) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Image size exceeds 2MB limit');
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid image format. Only JPEG, PNG, and WebP are allowed');
    }

    // Validate dimensions
    const metadata = await sharp(file.buffer).metadata();
    if (metadata?.width! < 200 || metadata?.height! < 200) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Image dimensions too small. Minimum 200x200 pixels required');
    }
  }


   private async optimizeImage(file: Express.Multer.File) {
        return await sharp(file.buffer)
        .resize(this.imageSpecs.width, this.imageSpecs.height, {
            fit: 'cover',
            position: 'center'
          })
          .webp({ quality: 80,
            effort: 6
          })
          .toBuffer();

   }
  
   private async uploadImageToCloudinary(optimizedBuffer: Buffer) {

    return await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${optimizedBuffer.toString('base64')}`,
      {
        folder: 'addon-images',
        resource_type: 'image',
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
      ]
      },
      

    );
}


async deleteImageFromCloudinary(publicId: string) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
    }
  }




}
