import { Router } from "express";
import multer from "multer";
import { ENUM_USER_ROLE } from "../../../../../enums/user";
import { userContextMiddleware } from "../../../../../middlewares/user-context.middleware";
import auth from "../../../../middlewares/auth";
import { ControllerFactory } from "../factories/controller.factory";

const addonController = ControllerFactory.createAddonController();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const router = Router();
router.post(
  "/create",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
  userContextMiddleware,
  upload.single("image"),
  addonController.createAddon
);
// router.post(
//   "/addon/group/create",
//   auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
//   userContextMiddleware,
//   addonController.createAddOnGroup
// );
router.get("/all", addonController.getAddOns);
router.get("/group/all", addonController.getAddOnGroups);
router.get("/group/:id", addonController.getAddOnGroupById);
router.patch("/group/:id", addonController.updateAddOnGroup);
router.delete("/group/:id", addonController.deleteAddOnGroup);

export const AddonRoutes = router;
