import { Router } from 'express';
import {
  handleCreateBusiness,
  handleDeleteBusiness,
  handleGetBusinesses,
  handleUpdateBusiness,
} from './business.controller';
import { canAccess } from '../middlewares/can-access.middleware';
import { validateZodSchema } from '../middlewares/validate-zod-schema.middleware';
import {
  businessCreateOrUpdateSchema,
  businessIdSchema,
} from './business.schema';

export const BUSINESS_ROUTER_ROOT = '/business';

const businessRouter = Router();

businessRouter.get('/', handleGetBusinesses);

businessRouter.post(
  '/',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({ body: businessCreateOrUpdateSchema }),
  handleCreateBusiness,
);

businessRouter.patch(
  '/:id',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({
    body: businessCreateOrUpdateSchema,
    params: businessIdSchema,
  }),
  handleUpdateBusiness,
);

businessRouter.delete(
  '/:id',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({
    params: businessIdSchema,
  }),
  handleDeleteBusiness,
);

export default businessRouter;
