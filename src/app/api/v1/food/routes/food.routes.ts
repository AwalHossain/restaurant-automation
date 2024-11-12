// routes/food.routes.ts
import { Router } from 'express';
import multer from 'multer';
import { CategoryController } from '../controllers/category.controller';
import { FoodController } from '../controllers/food.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const router = Router();
const foodController = new FoodController();
const categoryController = new CategoryController();

router.post(
  '/create',
  upload.single('image'),
  foodController.createFood
);

router.patch('/update/:id', foodController.updateFoodDetails);

router.get('/all', foodController.getAllFoods);

router.post('/category/create', categoryController.createCategory);
router.get('/category/all', categoryController.getAllCategories);
router.get('/category/:id', categoryController.getCategoryWithChildren);
router.get('/:id', foodController.getFoodById);

// router.patch('/foods/:foodId/status', foodController.updateStatus);
// router.patch('/foods/:foodId/price', foodController.updatePrice);

export const FoodRoutes = router;
