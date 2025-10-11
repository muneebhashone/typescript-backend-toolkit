import express from 'express';
import authRouter, { AUTH_ROUTER_ROOT } from '../modules/auth/auth.router';

import healthCheckRouter, {
  HEALTH_ROUTER_ROOT,
} from '../healthcheck/healthcheck.routes';
import userRouter, { USER_ROUTER_ROOT } from '../modules/user/user.router';
import uploadRouter, { UPLOAD_ROUTER_ROOT } from '../upload/upload.router';
import blogRouter, { BLOG_ROUTER_ROOT } from '../modules/blog/blog.router';
import paymentRouter, {
  PAYMENT_ROUTER_ROOT,
} from '../modules/payment/payment.router';

const router = express.Router();

router.use(HEALTH_ROUTER_ROOT, healthCheckRouter);
router.use(USER_ROUTER_ROOT, userRouter);
router.use(AUTH_ROUTER_ROOT, authRouter);
router.use(UPLOAD_ROUTER_ROOT, uploadRouter);
router.use(BLOG_ROUTER_ROOT, blogRouter);
router.use(PAYMENT_ROUTER_ROOT, paymentRouter);

export default router;
