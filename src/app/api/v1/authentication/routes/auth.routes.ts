import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const controller = new AuthController();

router.post('/send-otp',  controller.initiateUserRegistration);
router.post('/verify-otp', controller.verifyOTP);
router.post('/register-user', controller.completeUserRegistration);
router.post('/login-user', controller.userLogin);
router.post('/register-admin', controller.adminRegister);
router.post('/login-admin', controller.adminLogin);


export const AdminAuthRoutes = router;
