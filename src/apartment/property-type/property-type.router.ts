import { Router } from 'express';
import {
  handleCreatePropertyType,
  handleDeletePropertyType,
  handleGetPropertyTypes,
  handleSeedPropertyTypes,
  handleUpdatePropertyType,
} from './property-type.controller';
import { canAccess } from '../../middlewares/can-access.middleware';
import { validateZodSchema } from '../../middlewares/validate-zod-schema.middleware';
import {
  propertyTypeCreateOrUpdateSchema,
  propertyTypeIdSchema,
} from './property-type.schema';

export const PROPERTY_TYPE_ROUTER_ROOT = '/property-type';

const propertyTypeRouter = Router();

propertyTypeRouter.get('/', handleGetPropertyTypes);

propertyTypeRouter.get(
  '/seed',
  // canAccess('roles', ['SUPER_ADMIN']),
  handleSeedPropertyTypes,
);

propertyTypeRouter.post(
  '/',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({ body: propertyTypeCreateOrUpdateSchema }),
  handleCreatePropertyType,
);

propertyTypeRouter.patch(
  '/:id',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({
    body: propertyTypeCreateOrUpdateSchema,
    params: propertyTypeIdSchema,
  }),
  handleUpdatePropertyType,
);

propertyTypeRouter.delete(
  '/:id',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({
    params: propertyTypeIdSchema,
  }),
  handleDeletePropertyType,
);

export default propertyTypeRouter;
