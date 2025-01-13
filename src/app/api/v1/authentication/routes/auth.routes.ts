import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const controller = new AuthController();

router.post('/send-otp',  controller.initiateUserRegistration);
router.post('/verify-otp', controller.verifyOTP);
router.post('/register-user', controller.completeUserRegistration);
router.post('/login-user', controller.userLogin);


// staff/Admin routes (for internal use only)
router.post('/staff/register', controller.staffRegister);
router.post('/staff/login', controller.staffLogin);


export const AdminAuthRoutes = router;
