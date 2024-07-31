import mongoose from 'mongoose';
import {
  BusinessTypes,
  BusinessTypesUnion,
  IReviewType,
  IReview,
} from './review.types';

// Schema for ReviewType
const ReviewTypeSchema = new mongoose.Schema<IReviewType>({
  name: { type: String, required: true },
  value: { type: Number, required: true },
});

// Schema for Review
const ReviewSchema = new mongoose.Schema<IReview>(
  {
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    comment: { type: String, required: true },
    refId: { type: mongoose.Schema.Types.ObjectId, required: true },
    businessType: {
      type: String,
      enum: Object.keys(BusinessTypes) as BusinessTypesUnion[],
      required: true,
    },
    reviewTypes: [{ type: ReviewTypeSchema, required: true }],
    totalReviewValue: { type: Number, required: true },
  },
  { timestamps: true },
);

// Create and export Mongoose models
export const ReviewType = mongoose.model('ReviewType', ReviewTypeSchema);
export const Review = mongoose.model('Review', ReviewSchema);
