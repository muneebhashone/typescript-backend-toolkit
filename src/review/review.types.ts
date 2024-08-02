import mongoose from 'mongoose';
import { BusinessTypesUnion } from '../types';

export interface IReviewType {
  name: string;
  value: number;
}

export interface IReview {
  reviewerId: mongoose.Types.ObjectId;
  comment: string;
  refId: mongoose.Types.ObjectId;
  businessType: BusinessTypesUnion;
  reviewTypes: IReviewType[];
  totalReviewValue: number; // Average of all reviewTypes.value
  createdAt: Date;
  updatedAt: Date;
}
