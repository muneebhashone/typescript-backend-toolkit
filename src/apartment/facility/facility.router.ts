import { Router } from 'express';
import {
  handleCreateFacility,
  handleDeleteAllFacilities,
  handleDeleteFacility,
  handleGetFacilities,
  handleSeedFacilities,
  handleUpdateFacility,
} from './facility.controller';
import { canAccess } from '../../middlewares/can-access.middleware';
import { validateZodSchema } from '../../middlewares/validate-zod-schema.middleware';
import {
  facilityCreateOrUpdateSchema,
  facilityIdSchema,
} from './facility.schema';

export const FACILITY_ROUTER_ROOT = '/facility';

const facilityRouter = Router();

facilityRouter.get('/', handleGetFacilities);

facilityRouter.get(
  '/seed',
  // canAccess('roles', ['SUPER_ADMIN']),
  handleSeedFacilities,
);

facilityRouter.post(
  '/',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({ body: facilityCreateOrUpdateSchema }),
  handleCreateFacility,
);

facilityRouter.delete(
  '/',
  canAccess('roles', ['SUPER_ADMIN']),
  handleDeleteAllFacilities,
);

facilityRouter.patch(
  '/:id',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({
    body: facilityCreateOrUpdateSchema,
    params: facilityIdSchema,
  }),
  handleUpdateFacility,
);

facilityRouter.delete(
  '/:id',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({
    params: facilityIdSchema,
  }),
  handleDeleteFacility,
);

export default facilityRouter;
