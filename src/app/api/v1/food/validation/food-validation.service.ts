import httpStatus from "http-status";
import ApiError from "../../../../../errors/ApiError";
import { prisma } from "../../../../../shared/prisma";
import { CreateFoodAddonInput, CreateFoodInput } from "../dtos/food.dto";



// @Injectable()
export class FoodValidationService {
        async validateCreateFoodInput(input: CreateFoodInput) {
            // basic validation
            if( input.basePrice <= 0 ) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Base price must be greater than 0');
            }

            if (input.minOrderQuantity < 1) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Minimum order quantity must be at least 1');
              }
          
              // Validate categories exist
              const categories = await prisma.category.findMany({
                where: { id: {in: input?.categoryIds}}
              });
              if (categories.length !== input?.categoryIds?.length) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'One or more category IDs are invalid');
              }

            // validate variants exist
            if (input.variants?.length) {
                this.validateVariants(input.variants);
              } else if (input.isVariantRequired) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Variants are required for this food item');
              }

              // validate addon groups
              if (input.addonGroups?.length) {
                this.validateAddonGroups(input.addonGroups);
              }

            //     // Validate at least one image is present
    if (!input.images?.length) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'At least one image is required');
              }
    // Validate image types
    const hasRequiredDeviceTypes = input.images.some(img => img.deviceType === 'MOBILE');
    if (!hasRequiredDeviceTypes) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'At least one mobile image is required');
              }


}


              private validateVariants(variants: CreateFoodInput['variants']) {
                // check for duplicate names
                const variantNames = new Set();
                variants?.forEach(variants => {
                    if(variantNames.has(variants.name.toLowerCase())) {
                        throw new ApiError(httpStatus.BAD_REQUEST, 'Duplicate variant names are not allowed');
                    }
                    variantNames.add(variants.name.toLowerCase());

                    // validate base price
                    if(variants.basePrice <= 0) {
                        throw new ApiError(httpStatus.BAD_REQUEST, 'Base price must be greater than 0');
                    }
                })
              }

              private async validateAddonGroups(addonGroups: CreateFoodInput['addonGroups']) {
                // check for duplicate group names
                const groupNames = new Set();
                for(const group of addonGroups!) {
                    if(groupNames.has(group.name.toLowerCase())) {
                        throw new ApiError(httpStatus.BAD_REQUEST, 'Duplicate addon group names are not allowed');
                    }
                    groupNames.add(group.name.toLowerCase());

                    // validate max selections allowed
                    if(group.maxSelectionsAllowed < 1) {
                        throw new ApiError(httpStatus.BAD_REQUEST, 'Max selections allowed must be at least 1');
                    }

                    // if group is required, ensure at least one addon is selected
                    if(group.isRequired && group.maxSelectionsAllowed < 1) {
                        throw new ApiError(httpStatus.BAD_REQUEST, `Required addon group ${group.name} must allow at least one selection`);
                    }

                    // validate addons exist and are valid
                    const addonsId = group.addons?.map((addon: CreateFoodAddonInput)=>addon.addonId);
                    const addons = await prisma.addon.findMany({
                        where: { id: {in: addonsId}, isActive: true}
                    });
                    if (addons.length !== addonsId.length) {
                        throw new ApiError(httpStatus.BAD_REQUEST, `One or more addons in group ${group.name} are invalid or inactive`);
                      }

                    //   validate addon quantities
                    group.addons?.forEach((addon: CreateFoodAddonInput)=>{
                        if(addon.maxQuantity !== undefined && addon.maxQuantity < 1) {
                            throw new ApiError(httpStatus.BAD_REQUEST, `Invalid max quantity for addon ${group.name}`);
                        }
                    })
                }

            }
}
