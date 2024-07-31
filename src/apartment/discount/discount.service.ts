import { Discount } from '../apartment.model';
import { DiscountsType } from '../../types';
import {
  DiscountCreateOrUpdateSchemaType,
  DiscountIdSchemaType,
} from './discount.schema';

export const seedDiscounts = async (): Promise<DiscountsType[]> => {
  await Discount.deleteMany({});

  const data = [
    {
      title: 'Weekly Discount',
      description: 'For Stays Of 7 Nights Or More',
      value: 9,
    },
    {
      title: 'Monthly Discount',
      description: 'For Stays Of 28 Nights Or More',
      value: 15,
    },
  ];

  const insertedData = await Discount.insertMany(data);

  return insertedData;
};

export const getDiscount = async (): Promise<DiscountsType[]> => {
  const cancellationPolicy = await Discount.find({});

  return cancellationPolicy;
};

export const createDiscount = async (
  body: DiscountCreateOrUpdateSchemaType,
): Promise<DiscountsType | Error> => {
  const newDiscount = await Discount.create({ ...body });

  return newDiscount;
};

export const updateDiscount = async (
  payload: DiscountCreateOrUpdateSchemaType,
  discountId: DiscountIdSchemaType,
): Promise<DiscountsType> => {
  const { id } = discountId;
  const discount = await Discount.findByIdAndUpdate(
    id,
    {
      $set: {
        ...payload,
      },
    },
    {
      new: true,
    },
  );

  if (!discount) {
    throw new Error('Discount not found');
  }

  return discount;
};

export const deleteDiscount = async (
  discountId: DiscountIdSchemaType,
): Promise<void> => {
  const { id } = discountId;
  const deleted = await Discount.deleteOne({ _id: id });
  if (deleted.deletedCount < 1) {
    throw new Error('Discount does not Exist');
  }
};
