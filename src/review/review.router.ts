import { Router } from 'express';
import { canAccess } from '../middlewares/can-access.middleware';
import { validateZodSchema } from '../middlewares/validate-zod-schema.middleware';
import {
  handleCreateReview,
  handleDeleteReview,
  handleDeleteReviews,
  handleGetReview,
  handleGetReviews,
  handleUpdateReview,
} from './review.controller';
import {
  reviewSchema,
  reviewIdSchema,
  reviewRefIdSchema,
} from './review.schema';

export const REVIEW_ROUTER_ROOT = '/review';

const reviewRouter = Router();

reviewRouter.get(
  '/:refId/refId',
  validateZodSchema({ params: reviewRefIdSchema }),
  handleGetReviews,
);

reviewRouter.post(
  '/',
  canAccess('roles', ['DEFAULT_USER', 'SUPER_ADMIN']),
  validateZodSchema({ body: reviewSchema }),
  handleCreateReview,
);

reviewRouter.delete(
  '/',
  canAccess('roles', ['SUPER_ADMIN']),
  handleDeleteReviews,
);

reviewRouter.get(
  '/:id/id',
  validateZodSchema({ params: reviewIdSchema }),
  handleGetReview,
);

reviewRouter.patch(
  '/:id',
  canAccess('roles', ['DEFAULT_USER', 'SUPER_ADMIN']),
  validateZodSchema({
    body: reviewSchema,
    params: reviewIdSchema,
  }),
  handleUpdateReview,
);

reviewRouter.delete(
  '/:id',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({
    params: reviewIdSchema,
  }),
  handleDeleteReview,
);

export default reviewRouter;
