
import express from 'express';
import auth from '../../../../middlewares/auth';
import { CartController } from '../controllers/cart.controller';
import { CartService } from '../services/cart.service';

const router = express.Router();
const cartController = new CartController(new CartService());

router.post(
  '/add-to-cart',
  auth(),
  // validateRequest(addToCartSchema),
  cartController.addToCart
);

router.get(
  '/',
  auth(),
  cartController.getCart
);

router.patch(
  '/items/:cartItemId',
  auth(),
  cartController.updateCartItem
);

router.delete(
  '/items/:cartItemId',
  auth(),
  cartController.removeCartItem
);

router.delete(
  '/',
  auth(),
  cartController.clearCart
);

export const cartRoutes = router; 