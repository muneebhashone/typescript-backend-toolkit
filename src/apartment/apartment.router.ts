import { Router } from 'express';
import { canAccess } from '../middlewares/can-access.middleware';
import { validateZodSchema } from '../middlewares/validate-zod-schema.middleware';
import {
  handleCreateApartment,
  handleDeleteApartment,
  handleDeleteApartments,
  handleGetApartment,
  handleGetApartments,
  handleUpdateApartment,
} from './apartment.controller';
import {
  apartmentCreateOrUpdateSchema,
  apartmentIdSchema,
  apartmentListQueryParamsSchema,
} from './apartment.schema';

export const APARTMENT_ROUTER_ROOT = '/apartment';

const apartmentRouter = Router();

apartmentRouter.get(
  '/',
  validateZodSchema({ query: apartmentListQueryParamsSchema }),
  handleGetApartments,
);

apartmentRouter.post(
  '/',
  canAccess('roles', ['VENDOR', 'SUPER_ADMIN']),
  validateZodSchema({ body: apartmentCreateOrUpdateSchema }),
  handleCreateApartment,
);

apartmentRouter.delete(
  '/',
  canAccess('roles', ['VENDOR', 'SUPER_ADMIN']),
  handleDeleteApartments,
);

apartmentRouter.get('/:id', handleGetApartment);

apartmentRouter.patch(
  '/:id',
  canAccess('roles', ['VENDOR', 'SUPER_ADMIN']),
  validateZodSchema({
    body: apartmentCreateOrUpdateSchema,
    params: apartmentIdSchema,
  }),
  handleUpdateApartment,
);

apartmentRouter.delete(
  '/:id',
  canAccess('roles', ['VENDOR', 'SUPER_ADMIN']),
  validateZodSchema({
    params: apartmentIdSchema,
  }),
  handleDeleteApartment,
);

export default apartmentRouter;
