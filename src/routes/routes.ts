import express from 'express';
import authRouter from '../modules/auth/auth.router';

import healthCheckRouter from '../healthcheck/healthcheck.routes';
import userRouter from '../modules/user/user.router';
import uploadRouter from '../modules/upload/upload.router';
import RouteRoots from './roots';

const router = express.Router();

router.use(RouteRoots.HEALTHCHECK, healthCheckRouter);
router.use(RouteRoots.USER, userRouter);
router.use(RouteRoots.AUTH, authRouter);
router.use(RouteRoots.UPLOAD, uploadRouter);

export default router;
