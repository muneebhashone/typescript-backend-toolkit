import { Router } from 'express';
import { handleGetDiscounts, handleSeedDiscounts } from './discount.controller';

export const DISCOUNT_ROUTER_ROOT = '/discount';

const discountRouter = Router();

discountRouter.get('/', handleGetDiscounts);

discountRouter.get(
  '/seed',
  // canAccess('roles', ['SUPER_ADMIN']),
  handleSeedDiscounts,
);

// discountRouter.post(
//   '/',
//   canAccess('roles', ['SUPER_ADMIN']),
//   validateZodSchema({ body: discountCreateOrUpdateSchema }),
//   handleCreateDiscount,
// );

// discountRouter.patch(
//   '/:id',
//   canAccess('roles', ['SUPER_ADMIN']),
//   validateZodSchema({
//     body: discountCreateOrUpdateSchema,
//     params: discountIdSchema,
//   }),
//   handleUpdateDiscount,
// );

// discountRouter.delete(
//   '/:id',
//   canAccess('roles', ['SUPER_ADMIN']),
//   validateZodSchema({
//     params: discountIdSchema,
//   }),
//   handleDeleteDiscount,
// );

export default discountRouter;
