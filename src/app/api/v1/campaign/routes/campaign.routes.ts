import express from "express";
const router = express.Router();


import multer from "multer";
import { CampaignController } from "../controller/campaign.controller";

const campaignController = new CampaignController();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    }
  });

router.post("/create",
    upload.single('image'),
     campaignController.createCampaign);
router.get("/:id", campaignController.getCampaignById);
router.get("/", campaignController.getAllCampaigns);
router.patch("/:id", campaignController.updateCampaign);
router.delete("/:id", campaignController.deleteCampaign);

export const campaignRoutes = router;
