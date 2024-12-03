import { AddOnImageService } from "../../../../../services/addonImage.service";
import { ImageService } from "../../../../../services/foodImage.services";
import { AddonController } from "../controllers/addon.controller";
import { CategoryController } from "../controllers/category.controller";
import { FoodController } from "../controllers/food.controller";
import { VariantController } from "../controllers/variants.controller";
import { AddOnService } from "../services/addon.service";
import { CategoryService } from "../services/category.services";
import { FoodService } from "../services/food.services";
import { VariantService } from "../services/variants.service";
import { AddOnValidationService } from "../validation/addon-validation.service";
import { CategoryValidationService } from "../validation/category-validation.service";
import { VariantValidationService } from "../validation/variant-validation.service";

export class ControllerFactory {
  static createAddonController() {
    const addOnService = new AddOnService();
    const addOnImageService = new AddOnImageService();
    const addOnValidationService = new AddOnValidationService();

    return new AddonController(addOnService, addOnImageService, addOnValidationService);
  }

  static createFoodController() {
    const foodService = new FoodService();
    const imageService = new ImageService();

    return new FoodController(foodService, imageService);
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
