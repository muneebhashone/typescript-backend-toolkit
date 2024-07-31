import { Router } from 'express';
import {
  handleCreateTypeOfPlace,
  handleDeleteTypeOfPlace,
  handleGetTypesOfPlace,
  handleSeedTypesOfPlace,
  handleUpdateTypeOfPlace,
} from './type-of-place.controller';
import { canAccess } from '../../middlewares/can-access.middleware';
import { validateZodSchema } from '../../middlewares/validate-zod-schema.middleware';
import {
  typeOfPlaceCreateOrUpdateSchema,
  typeOfPlaceIdSchema,
} from './type-of-place.schema';

export const TYPE_OF_PLACE_ROUTER_ROOT = '/type-of-place';

const typeOfPlaceRouter = Router();

typeOfPlaceRouter.get('/', handleGetTypesOfPlace);

typeOfPlaceRouter.get(
  '/seed',
  // canAccess('roles', ['SUPER_ADMIN']),
  handleSeedTypesOfPlace,
);

typeOfPlaceRouter.post(
  '/',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({ body: typeOfPlaceCreateOrUpdateSchema }),
  handleCreateTypeOfPlace,
);

typeOfPlaceRouter.patch(
  '/:id',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({
    body: typeOfPlaceCreateOrUpdateSchema,
    params: typeOfPlaceIdSchema,
  }),
  handleUpdateTypeOfPlace,
);

typeOfPlaceRouter.delete(
  '/:id',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({
    params: typeOfPlaceIdSchema,
  }),
  handleDeleteTypeOfPlace,
);

export default typeOfPlaceRouter;
