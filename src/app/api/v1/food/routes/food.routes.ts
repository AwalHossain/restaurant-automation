// routes/food.routes.ts
import { Router } from "express";
import multer from "multer";
import { ENUM_USER_ROLE } from "../../../../../enums/user";
import auth from "../../../../middlewares/auth/auth-middleware";
import { ControllerFactory, VariantControllerFactory } from "../factories/controller.factory";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const router = Router();

const foodController = ControllerFactory.createFoodController();
const variantController = VariantControllerFactory.createVariantController();

// food routes
router.post(
  "/create",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
  upload.single("image"),
  foodController.createFood
);

router.patch(
  "/update/:id",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
  upload.single("image"),
  foodController.updateFoodDetails
);

router.get("/all", foodController.getAllFoods);
router.get("/main-category/:id", foodController.getFoodByMainCategoryId);
router.get("/sub-category/:id", foodController.getFoodBySubCategoryId);
router.get("/category/:id", foodController.getFoodByCategoryId);
router.post("/step/variant/create", foodController.addVariants);
// router.post(
//   "/step/addon/create",
//   auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
//   userContextMiddleware,
//   foodController.addAddonGroups
// );

router.get("/:id", foodController.getFoodById);

// category routes

// Addon routes

// variant routes

export const FoodRoutes = router;
