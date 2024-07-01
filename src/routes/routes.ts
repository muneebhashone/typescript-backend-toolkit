import express from 'express';
import userRouter, { USER_ROUTER_ROOT } from '../user/user.router';
import authRouter, { AUTH_ROUTER_ROOT } from '../auth/auth.routes';
import healthCheckRouter, {
  HEALTH_ROUTER_ROOT,
} from '../healthcheck/healthcheck.routes';
import businessRouter, {
  BUSINESS_ROUTER_ROOT,
} from '../business/business.router';

const router = express.Router();

router.use(HEALTH_ROUTER_ROOT, healthCheckRouter);
router.use(USER_ROUTER_ROOT, userRouter);
router.use(AUTH_ROUTER_ROOT, authRouter);
router.use(BUSINESS_ROUTER_ROOT, businessRouter);

export default router;
