import { CancellationPolicy } from '../apartment.model';
import { CancellationPoliciesType } from '../../types';
import {
  CancellationPolicyCreateOrUpdateSchemaType,
  CancellationPolicyIdSchemaType,
} from './cancellation-policy.schema';

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

export const createCancellationPolicy = async (
  body: CancellationPolicyCreateOrUpdateSchemaType,
): Promise<CancellationPoliciesType | Error> => {
  const newCancellationPolicy = await CancellationPolicy.create({
    ...body,
  });

  return newCancellationPolicy;
};

export const updateCancellationPolicy = async (
  payload: CancellationPolicyCreateOrUpdateSchemaType,
  cancellationPolicyId: CancellationPolicyIdSchemaType,
): Promise<CancellationPoliciesType> => {
  const { id } = cancellationPolicyId;
  const cancellationPolicy = await CancellationPolicy.findByIdAndUpdate(
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

  if (!cancellationPolicy) {
    throw new Error('CancellationPolicy not found');
  }

  return cancellationPolicy;
};

export const deleteCancellationPolicy = async (
  cancellationPolicyId: CancellationPolicyIdSchemaType,
): Promise<void> => {
  const { id } = cancellationPolicyId;
  const deleted = await CancellationPolicy.deleteOne({ _id: id });
  if (deleted.deletedCount < 1) {
    throw new Error('Cancellation Policy does not Exist');
  }
};
