import { Router } from "express";
import { ENUM_USER_ROLE } from "../../../../../enums/user";
import { userContextMiddleware } from "../../../../../middlewares/user-context.middleware";
import auth from "../../../../middlewares/auth/auth-middleware";
import { ControllerFactory } from "../factories/controller.factory";

const router = Router();

const categoryController = ControllerFactory.createCategoryController();

router.post("/create", categoryController.createCategory);
router.get("/all", categoryController.getAllCategories);
router.get("/active", categoryController.getActiveCategories);
router.get("/:id", categoryController.getCategoryWithChildren);
router.patch("/toggle/:id",
   auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
   categoryController.toggleFoodCategoryActiveStatus);

router.post(
  "/add-sub",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
  userContextMiddleware,
  categoryController.addSubCategory
);
router.patch(
  "/update",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
  userContextMiddleware,
  categoryController.updateCategoryWithSubs
);

export const CategoryRoutes = router;
