import { Router } from "express";
import multer from "multer";
import { ENUM_USER_ROLE } from "../../../../../enums/user";
import { ImageService } from "../../../../../services/foodImage.services";
import auth from "../../../../middlewares/auth";
import { PromotionController } from "../controllers/promotion.controller";
import { PromotionService } from "../services/promotion.services";
import { PromotionValidationService } from "../validation/promotion-validation.service";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const router = Router();

// Initialize services and controller
const imageService = new ImageService();
const promotionValidationService = new PromotionValidationService();
const promotionService = new PromotionService(promotionValidationService);
const promotionController = new PromotionController(imageService, promotionService);

// Admin/Manager routes (Protected)
router.post(
  "/create",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
  upload.single("image"),
  promotionController.createPromotion
);

router.get("/foods/:promotionId", promotionController.getPromotionFoods);

router.patch(
  "/update/:id",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
  upload.single("image"),
  promotionController.updatePromotion
);

// router.delete(
//   "/delete/:id",
//   auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER, ENUM_USER_ROLE.SUPER_ADMIN),
//   promotionController.deletePromotion
// );

// Public routes (No auth required)
router.get("/active", promotionController.getActivePromotions);
router.get("/upcoming", promotionController.getUpcomingPromotions);
router.get("/:id/foods", promotionController.getPromotionById);

// User routes (Auth required)
router.get("/user/history", auth(ENUM_USER_ROLE.CUSTOMER), promotionController.getUserPromotionHistory);

router.get(
  "/check-eligibility/:promotionId",
  auth(ENUM_USER_ROLE.CUSTOMER),
  
  promotionController.checkPromotionEligibility
);

router.post("/track-usage/:promotionId", auth(ENUM_USER_ROLE.CUSTOMER), promotionController.trackPromotionUsage);

router.get("/all", promotionController.getAllPromotions);
export const PromotionRoutes = router;
