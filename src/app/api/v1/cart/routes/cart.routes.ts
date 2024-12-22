
import express from 'express';
import { ENUM_USER_ROLE } from '../../../../../enums/user';
import auth from '../../../../middlewares/auth';
import { CartController } from '../controllers/cart.controller';
import { CartService } from '../services/cart.service';

const router = express.Router();
const cartController = new CartController(new CartService());

router.post(
  '/add-to-cart',
  auth(ENUM_USER_ROLE.CUSTOMER),
  // validateRequest(addToCartSchema),
  cartController.addToCart
);

router.get(
  '/',
  auth(ENUM_USER_ROLE.CUSTOMER),
  cartController.getCart
);

router.patch(
  '/items/:cartItemId',
  auth(ENUM_USER_ROLE.CUSTOMER),
  cartController.updateCartItem
);

router.delete(
  '/items/:cartItemId',
  auth(ENUM_USER_ROLE.CUSTOMER, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER),
  cartController.removeCartItem
);

router.delete(
  '/',
  auth(ENUM_USER_ROLE.CUSTOMER, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MANAGER),
  cartController.clearCart
);

export const cartRoutes = router; 