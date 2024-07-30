import { CancellationPolicy } from '../models/apartment';
import { CancellationPoliciesType } from '../types';

export const seedCancellationPolicies = async (): Promise<
  CancellationPoliciesType[]
> => {
  await CancellationPolicy.deleteMany({});

  const data = [
    {
      policy: 'NO_CANCELLATION',
      description: 'Free cancellation for 48 hours.',
    },
    {
      policy: 'FREE_CANCELLATION',
      description: 'Free cancellation for 48 hours.',
    },
    {
      policy: 'FLEXIBLE_OR_NON_REFUNDABLE',
      description:
        'In addition to Flexible, offer a non-refundable option-guests pay 10% less, but you keep your payout no matter when they cancel.',
    },
    {
      policy: 'MODERATE',
      description: 'Full refund 5 days prior to arrival.',
    },
  ];

  const insertedData = await CancellationPolicy.insertMany(data);

  return insertedData;
};

export const getCancellationPolicy = async (): Promise<
  CancellationPoliciesType[]
> => {
  const cancellationPolicy = await CancellationPolicy.find({});

  return cancellationPolicy;
};

// export const createCancellationPolicy = async (
//   body: CancellationPolicyCreateOrUpdateSchemaType,
// ): Promise<CancellationPoliciesType | Error> => {
//   try {
//     const newCancellationPolicy = await db
//       .insert(cancellationPolicies)
//       .values({ ...body })
//       .returning()
//       .execute();

//     return newCancellationPolicy[0];
//   } catch (_) {
//     return new Error('Error creating Cancellation Policy');
//   }
// };

// export const updateCancellationPolicy = async (
//   payload: CancellationPolicyCreateOrUpdateSchemaType,
//   cancellationPolicyId: CancellationPolicyIdSchemaType,
// ): Promise<CancellationPoliciesType> => {
//   const { id } = cancellationPolicyId;
//   const cancellationPolicy = await db.query.cancellationPolicies.findFirst({
//     where: eq(cancellationPolicies.id, id),
//   });

//   if (!cancellationPolicy) {
//     throw new Error('CancellationPolicy not found');
//   }

//   const updatedCancellationPolicy = await db
//     .update(cancellationPolicies)
//     .set({ ...payload })
//     .where(eq(cancellationPolicies.id, id))
//     .returning()
//     .execute();

//   return updatedCancellationPolicy[0];
// };

// export const deleteCancellationPolicy = async (
//   cancellationPolicyId: number,
// ): Promise<void> => {
//   await db
//     .delete(cancellationPolicies)
//     .where(eq(cancellationPolicies.id, cancellationPolicyId));
// };
