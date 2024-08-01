import { Review } from './review.model';
import { IReview } from './review.types';
import { JwtPayload } from '../utils/auth.utils';
import { ReviewSchemaType, ReviewIdSchemaType } from './review.schema';

export const getReviews = async (refId: string): Promise<IReview[]> => {
  const results = await Review.find({ refId: refId });

  return results;
};

export const getReview = async (
  reviewId: ReviewIdSchemaType,
): Promise<IReview> => {
  const { id } = reviewId;
  const result = await Review.findOne({ _id: id });

  if (!result) {
    throw new Error('Review not found');
  }

  return result;
};

export const createReview = async (
  body: ReviewSchemaType,
  user: JwtPayload,
): Promise<IReview> => {
  const totalReviewValue =
    body.reviewTypes.reduce((acc, curr) => acc + curr.value, 0) /
    body.reviewTypes.length;

  const review = await Review.create({
    ...body,
    reviewerId: user.sub,
    totalReviewValue: totalReviewValue,
  });

  return review;
};

export const updateReview = async (
  reviewId: ReviewIdSchemaType,
  body: ReviewSchemaType,
): Promise<IReview> => {
  const totalReviewValue =
    body.reviewTypes.reduce((acc, curr) => acc + curr.value, 0) /
    body.reviewTypes.length;

  const { id } = reviewId;
  const review = await Review.findByIdAndUpdate(
    id,
    {
      $set: {
        ...body,
        totalReviewValue: totalReviewValue,
      },
    },
    {
      new: true,
    },
  );

  if (!review) {
    throw new Error('Review does not exist');
  }

  return review;
};

export const deleteReview = async (
  reviewId: ReviewIdSchemaType,
): Promise<void> => {
  const { id } = reviewId;
  const deleted = await Review.deleteOne({
    _id: id,
  });

  if (deleted.deletedCount < 1) {
    throw new Error('Review does not exist');
  }
};

export const deleteReviews = async (): Promise<void> => {
  await Review.deleteMany({});
};
