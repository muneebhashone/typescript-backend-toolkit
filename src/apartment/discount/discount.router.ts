import { Router } from 'express';
import {
  handleCreateDiscount,
  handleDeleteDiscount,
  handleGetDiscounts,
  handleSeedDiscounts,
  handleUpdateDiscount,
} from './discount.controller';
import { canAccess } from '../../middlewares/can-access.middleware';
import { validateZodSchema } from '../../middlewares/validate-zod-schema.middleware';
import {
  discountCreateOrUpdateSchema,
  discountIdSchema,
} from './discount.schema';

export const DISCOUNT_ROUTER_ROOT = '/discount';

const discountRouter = Router();

discountRouter.get('/', handleGetDiscounts);

discountRouter.get(
  '/seed',
  // canAccess('roles', ['SUPER_ADMIN']),
  handleSeedDiscounts,
);

discountRouter.post(
  '/',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({ body: discountCreateOrUpdateSchema }),
  handleCreateDiscount,
);

discountRouter.patch(
  '/:id',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({
    body: discountCreateOrUpdateSchema,
    params: discountIdSchema,
  }),
  handleUpdateDiscount,
);

discountRouter.delete(
  '/:id',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({
    params: discountIdSchema,
  }),
  handleDeleteDiscount,
);

export default discountRouter;
