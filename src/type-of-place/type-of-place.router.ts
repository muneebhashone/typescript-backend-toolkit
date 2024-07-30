import { Router } from 'express';
import {
  handleGetTypesOfPlace,
  handleSeedTypesOfPlace,
} from './type-of-place.controller';

export const TYPE_OF_PLACE_ROUTER_ROOT = '/type-of-place';

const typeOfPlaceRouter = Router();

typeOfPlaceRouter.get('/', handleGetTypesOfPlace);

typeOfPlaceRouter.get(
  '/seed',
  // canAccess('roles', ['SUPER_ADMIN']),
  handleSeedTypesOfPlace,
);

// typeOfPlaceRouter.post(
//   '/',
//   canAccess('roles', ['SUPER_ADMIN']),
//   validateZodSchema({ body: typeOfPlaceCreateOrUpdateSchema }),
//   handleCreateTypeOfPlace,
// );

// typeOfPlaceRouter.patch(
//   '/:id',
//   canAccess('roles', ['SUPER_ADMIN']),
//   validateZodSchema({
//     body: typeOfPlaceCreateOrUpdateSchema,
//     params: typeOfPlaceIdSchema,
//   }),
//   handleUpdateTypeOfPlace,
// );

// typeOfPlaceRouter.delete(
//   '/:id',
//   canAccess('roles', ['SUPER_ADMIN']),
//   validateZodSchema({
//     params: typeOfPlaceIdSchema,
//   }),
//   handleDeleteTypeOfPlace,
// );

export default typeOfPlaceRouter;
