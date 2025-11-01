import express from 'express';
import authRouter, { AUTH_ROUTER_ROOT } from '../modules/auth/auth.router';

import userRouter, { USER_ROUTER_ROOT } from '../modules/user/user.router';
import uploadRouter, {
  UPLOAD_ROUTER_ROOT,
} from '../modules/upload/upload.router';
import healthCheckRouter, {
  HEALTH_ROUTER_ROOT,
} from '../modules/healthcheck/healthcheck.routes';

const router = express.Router();

router.use(HEALTH_ROUTER_ROOT, healthCheckRouter);
router.use(USER_ROUTER_ROOT, userRouter);
router.use(AUTH_ROUTER_ROOT, authRouter);
router.use(UPLOAD_ROUTER_ROOT, uploadRouter);

export default router;
