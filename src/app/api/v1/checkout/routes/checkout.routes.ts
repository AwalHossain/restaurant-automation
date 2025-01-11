import express from 'express';
import { ENUM_USER_ROLE } from '../../../../../enums/user';
import auth from '../../../../middlewares/auth/auth-middleware';
import { CheckoutController } from '../controllers/checkout.controller';

const router = express.Router();
const checkoutController = new CheckoutController();

router.use(auth(
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.CUSTOMER
)); // Apply authentication middleware to all checkout routes

router.post(
  '/calculate',
  checkoutController.calculateTotals
);

router.post(
  '/validate-promo',
  checkoutController.validatePromoCode
);

router.post(
  '/validate-points',
  checkoutController.validatePoints
);

router.post(
  '/pre-checkout',
  checkoutController.preCheckout
);

router.post(
  '/',
  checkoutController.createCheckout
);

router.get(
  '/',
  auth(
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.CUSTOMER
  ),
  checkoutController.getAllCheckouts
);

router.get(
  '/:id/orderId',
  auth(
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.CUSTOMER
  ),
  checkoutController.getCheckoutByOrderId
);

router.get(
  '/user',
  auth(
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.CUSTOMER
  ),
  checkoutController.getCheckoutByUserId
);

export const checkoutRoutes = router; 