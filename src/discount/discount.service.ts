import { Discount } from '../models/apartment';
import { DiscountsType } from '../types';

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

// export const createDiscount = async (
//   body: DiscountCreateOrUpdateSchemaType,
// ): Promise<DiscountsType | Error> => {
//   try {
//     const newDiscount = await db
//       .insert(discounts)
//       .values({ ...body })
//       .returning()
//       .execute();

//     return newDiscount[0];
//   } catch (_) {
//     return new Error('Error creating discount');
//   }
// };

// export const updateDiscount = async (
//   payload: DiscountCreateOrUpdateSchemaType,
//   discountId: DiscountIdSchemaType,
// ): Promise<DiscountsType> => {
//   const { id } = discountId;
//   const discount = await db.query.discounts.findFirst({
//     where: eq(discounts.id, id),
//   });

//   if (!discount) {
//     throw new Error('Discount not found');
//   }

//   const updatedDiscount = await db
//     .update(discounts)
//     .set({ ...payload })
//     .where(eq(discounts.id, id))
//     .returning()
//     .execute();

//   return updatedDiscount[0];
// };

// export const deleteDiscount = async (discountId: number): Promise<void> => {
//   await db.delete(discounts).where(eq(discounts.id, discountId));
// };
