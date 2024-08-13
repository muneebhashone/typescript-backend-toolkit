import express from 'express';
import authRouter, { AUTH_ROUTER_ROOT } from '../auth/auth.router';

import healthCheckRouter, {
  HEALTH_ROUTER_ROOT,
} from '../healthcheck/healthcheck.routes';
import mockRouter from '../mock/seed.route';
import uploadRouter, { UPLOAD_ROUTER_ROOT } from '../upload/upload.router';
import userRouter, { USER_ROUTER_ROOT } from '../user/user.router';

const router = express.Router();

router.use(HEALTH_ROUTER_ROOT, healthCheckRouter);
router.use(USER_ROUTER_ROOT, userRouter);
router.use(AUTH_ROUTER_ROOT, authRouter);
router.use(UPLOAD_ROUTER_ROOT, uploadRouter);

router.use(mockRouter);

export default router;
