// routes/food.routes.ts
import { Router } from "express";
import multer from "multer";
import { ENUM_USER_ROLE } from "../../../../../enums/user";
import auth from "../../../../middlewares/auth";
import { ControllerFactory, VariantControllerFactory } from "../factories/controller.factory";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const router = Router();

const foodController = ControllerFactory.createFoodController();
const categoryController = ControllerFactory.createCategoryController();
const addonController = ControllerFactory.createAddonController();
const variantController = VariantControllerFactory.createVariantController();

router.post(
  "/create",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
  upload.single("image"),
  foodController.createFood
);

router.patch(
  "/update/:id",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
  foodController.updateFoodDetails
);

router.get("/all", foodController.getAllFoods);
router.get("/main-category/:id", foodController.getFoodByMainCategoryId);
router.get("/sub-category/:id", foodController.getFoodBySubCategoryId);

// category routes
router.post("/category/create", categoryController.createCategory);
router.get("/category/all", categoryController.getAllCategories);
router.get("/category/:id", categoryController.getCategoryWithChildren);
router.get("/:id", foodController.getFoodById);

router.post(
  "/category/add-sub",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
  categoryController.addSubCategory
);
router.patch(
  "/category/update",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
  categoryController.updateCategoryWithSubs
);

// Addon routes
router.post(
  "/addon/create",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
  upload.single("image"),
  addonController.createAddon
);
router.post(
  "/addon/group/create",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
  addonController.createAddOnGroup
);
router.get("/addon/all", addonController.getAddOns);
router.get("/addon/group/all", addonController.getAddOnGroups);
router.get("/addon/group/:id", addonController.getAddOnGroupById);
router.patch("/addon/group/:id", addonController.updateAddOnGroup);
router.delete("/addon/group/:id", addonController.deleteAddOnGroup);

// variant routes
router.post("/variant/create/:foodId", variantController.bulkUpdateVariants);
router.get("/variant/all/:foodId", variantController.getVariantsByFoodId);
router.patch("/variant/update/:variantId", variantController.updateVariant);

export const FoodRoutes = router;
