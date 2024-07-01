import { InferInsertModel, eq } from 'drizzle-orm';
import { db } from '../drizzle/db';
import { businesses } from '../drizzle/schema';
import { BusinessType } from '../types';

export const getBusiness = async (): Promise<BusinessType[]> => {
  const business = await db.query.businesses.findMany();

  return business;
};

export const createBusiness = async (name: string): Promise<BusinessType> => {
  const exist = await db.query.businesses.findFirst({
    where: eq(businesses.name, name),
  });

  if (exist) {
    throw new Error('Business is already exist with same name');
  }

  const newBusiness = await db
    .insert(businesses)
    .values({ name: name })
    .returning()
    .execute();

  return newBusiness[0];
};

export const updateBusiness = async (
  payload: { name?: string; thumbnail?: string },
  businessId: number,
): Promise<BusinessType> => {
  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
  });

  if (!business) {
    throw new Error('Business not found');
  }

  const updatedBusiness = await db
    .update(businesses)
    .set({ ...payload })
    .where(eq(businesses.id, businessId))
    .returning()
    .execute();

  return updatedBusiness[0];
};

export const deleteBusiness = async (businessId: number): Promise<void> => {
  await db.delete(businesses).where(eq(businesses.id, businessId));
};
