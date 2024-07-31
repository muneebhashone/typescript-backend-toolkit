import mongoose from 'mongoose';

export const BusinessTypes = {
  apartment: 'apartment',
  car: 'car',
  jet: 'jet',
  boat: 'boat',
};

export type BusinessTypesUnion = keyof typeof BusinessTypes;

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
