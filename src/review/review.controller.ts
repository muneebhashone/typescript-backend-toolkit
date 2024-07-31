import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../utils/api.utils';
import {
  createReview,
  deleteReview,
  deleteReviews,
  getReview,
  getReviews,
  updateReview,
} from './review.service';
import { ReviewSchemaType, ReviewIdSchemaType } from './review.schema';
import { JwtPayload } from '../utils/auth.utils';

export const handleGetReviews = async (
  _: Request<never, never, never>,
  res: Response,
) => {
  try {
    const result = await getReviews();

    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleCreateReview = async (
  req: Request<never, never, ReviewSchemaType>,
  res: Response,
) => {
  try {
    const newReview = await createReview(req.body, req.user);

    return successResponse(res, 'Review created successfully', newReview);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleUpdateReview = async (
  req: Request<ReviewIdSchemaType, never, ReviewSchemaType>,
  res: Response,
) => {
  try {
    const currentUser = req.user as JwtPayload;

    const updatedReview = await updateReview(
      {
        id: req.params.id,
      },
      { ...req.body, reviewerId: currentUser.sub },
    );

    return successResponse(res, 'Review updated successfully', updatedReview);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleGetReview = async (
  req: Request<ReviewIdSchemaType>,
  res: Response,
) => {
  try {
    const result = await getReview({ id: req.params.id });

    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleDeleteReview = async (
  req: Request<ReviewIdSchemaType>,
  res: Response,
) => {
  try {
    await deleteReview({ id: req.params.id });

    return successResponse(res, 'Review deleted successfully');
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleDeleteReviews = async (_: Request, res: Response) => {
  try {
    await deleteReviews();

    return successResponse(res, 'Reviews deleted successfully');
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};
