import { Router } from 'express';
import {
  handleGetFacilities,
  handleSeedFacilities,
} from './facility.controller';

export const FACILITY_ROUTER_ROOT = '/facility';

const facilityRouter = Router();

facilityRouter.get('/', handleGetFacilities);

facilityRouter.get(
  '/seed',
  // canAccess('roles', ['SUPER_ADMIN']),
  handleSeedFacilities,
);

// facilityRouter.post(
//   '/',
//   canAccess('roles', ['SUPER_ADMIN']),
//   validateZodSchema({ body: facilityCreateOrUpdateSchema }),
//   handleCreateFacility,
// );

// facilityRouter.patch(
//   '/:id',
//   canAccess('roles', ['SUPER_ADMIN']),
//   validateZodSchema({
//     body: facilityCreateOrUpdateSchema,
//     params: facilityIdSchema,
//   }),
//   handleUpdateFacility,
// );

// facilityRouter.delete(
//   '/:id',
//   canAccess('roles', ['SUPER_ADMIN']),
//   validateZodSchema({
//     params: facilityIdSchema,
//   }),
//   handleDeleteFacility,
// );

export default facilityRouter;
