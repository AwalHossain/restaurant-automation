import { AddOnImageService } from "../../../../../services/addonImage.service";
import { ImageService } from "../../../../../services/foodImage.services";
import { AddonController } from "../controllers/addon.controller";
import { CategoryController } from "../controllers/category.controller";
import { FoodController } from "../controllers/food.controller";
import { VariantController } from "../controllers/variants.controller";
import { AddonService } from "../services/addon.service";

import { CategoryService } from "../services/category.services";
import { FoodService } from "../services/food.services";
import { VariantService } from "../services/variants.service";
import { AddOnValidationService } from "../validation/addon-validation.service";
import { CategoryValidationService } from "../validation/category-validation.service";
import { FoodValidationService } from "../validation/food-validation.service";
import { VariantValidationService } from "../validation/variant-validation.service";

export class ControllerFactory {
  static createAddonController() {
    const addOnService = new AddonService();
    const addOnImageService = new AddOnImageService();

    return new AddonController();
  }

  static createFoodController() {
    // First, create services with their own dependencies
    const addOnValidationService = new AddOnValidationService();
    const addOnService = new AddonService();

    const variantValidationService = new VariantValidationService();
    const variantService = new VariantService(variantValidationService);

    const foodService = new FoodService(new FoodValidationService(), variantService, addOnService);
    const imageService = new ImageService();

    const foodValidationService = new FoodValidationService();

    return new FoodController(foodService, imageService, foodValidationService);
  }

  static createCategoryController() {
    const categoryService = new CategoryService();
    const categoryValidationService = new CategoryValidationService();

    return new CategoryController(categoryService, categoryValidationService);
  }
}

export class VariantControllerFactory {
  static createVariantController() {
    const variantService = new VariantService(new VariantValidationService());

    return new VariantController(variantService);
  }
}
