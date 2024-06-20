import express from 'express';
import trackingRouter, {
  TRACKING_ROUTER_ROOT,
} from '../tracking/tracking.router';
import shipmentRouter, {
  SHIPMENT_ROUTER_ROOT,
} from '../shipment/shipment.router';
import userRouter, { USER_ROUTER_ROOT } from '../user/user.router';
import companyRouter, { COMPANY_ROUTER_ROOT } from '../company/company.router';
import authRouter, { AUTH_ROUTER_ROOT } from '../auth/auth.routes';
import healthCheckRouter, {
  HEALTH_ROUTER_ROOT,
} from '../healthcheck/healthcheck.routes';

const router = express.Router();

router.use(HEALTH_ROUTER_ROOT, healthCheckRouter);
router.use(TRACKING_ROUTER_ROOT, trackingRouter);
router.use(SHIPMENT_ROUTER_ROOT, shipmentRouter);
router.use(USER_ROUTER_ROOT, userRouter);
router.use(COMPANY_ROUTER_ROOT, companyRouter);
router.use(AUTH_ROUTER_ROOT, authRouter);

export default router;
