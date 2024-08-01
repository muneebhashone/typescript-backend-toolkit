import { Router } from 'express';
import { canAccess } from '../../middlewares/can-access.middleware';
import { validateZodSchema } from '../../middlewares/validate-zod-schema.middleware';
import {
  handleCreateCar,
  handleDeleteCar,
  handleDeleteCars,
  handleGetCar,
  handleGetCarMakes,
  handleGetCarModelsByMake,
  handleGetCars,
  handleUpdateCar,
} from './car-listing.controller';
import {
  carCreateSchema,
  carUpdateSchema,
  carIdSchema,
  carListQueryParamsSchema,
  carMakeSchema,
} from './car-listing.schema';

export const CAR_ROUTER_ROOT = '/car';

const carRouter = Router();

carRouter.get('/makes', handleGetCarMakes);
carRouter.get(
  '/:make/models',
  validateZodSchema({ params: carMakeSchema }),
  handleGetCarModelsByMake,
);

carRouter.get(
  '/',
  validateZodSchema({ query: carListQueryParamsSchema }),
  handleGetCars,
);

carRouter.post(
  '/',
  canAccess('roles', ['VENDOR', 'SUPER_ADMIN']),
  validateZodSchema({ body: carCreateSchema }),
  handleCreateCar,
);

carRouter.delete(
  '/',
  canAccess('roles', ['VENDOR', 'SUPER_ADMIN']),
  handleDeleteCars,
);

carRouter.get('/:id', validateZodSchema({ params: carIdSchema }), handleGetCar);

carRouter.patch(
  '/:id',
  canAccess('roles', ['VENDOR', 'SUPER_ADMIN']),
  validateZodSchema({
    body: carUpdateSchema,
    params: carIdSchema,
  }),
  handleUpdateCar,
);

carRouter.delete(
  '/:id',
  canAccess('roles', ['VENDOR', 'SUPER_ADMIN']),
  validateZodSchema({
    params: carIdSchema,
  }),
  handleDeleteCar,
);

export default carRouter;
