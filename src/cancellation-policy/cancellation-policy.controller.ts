import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../utils/api.utils';
import {
  getCancellationPolicy,
  seedCancellationPolicies,
} from './cancellation-policy.service';

export const handleSeedCancellationPolicies = async (
  _: Request,
  res: Response,
) => {
  try {
    const result = await seedCancellationPolicies();

    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleGetCancellationPolicies = async (
  _: Request,
  res: Response,
) => {
  try {
    const result = await getCancellationPolicy();

    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

// export const handleCreateCancellationPolicy = async (
//   req: Request<never, never, CancellationPolicyCreateOrUpdateSchemaType>,
//   res: Response,
// ) => {
//   try {
//     const newCancellationPolicy = await createCancellationPolicy(req.body);

//     return successResponse(
//       res,
//       'CancellationPolicy created successfully',
//       newCancellationPolicy,
//     );
//   } catch (err) {
//     return errorResponse(res, (err as Error).message);
//   }
// };

// export const handleUpdateCancellationPolicy = async (
//   req: Request<
//     CancellationPolicyIdSchemaType,
//     never,
//     CancellationPolicyCreateOrUpdateSchemaType
//   >,
//   res: Response,
// ) => {
//   try {
//     const udpatedCancellationPolicy = await updateCancellationPolicy(req.body, {
//       id: req.params.id,
//     });

//     return successResponse(
//       res,
//       'CancellationPolicy updated successfully',
//       udpatedCancellationPolicy,
//     );
//   } catch (err) {
//     return errorResponse(res, (err as Error).message);
//   }
// };

// export const handleDeleteCancellationPolicy = async (
//   req: Request<CancellationPolicyIdSchemaType, never, never>,
//   res: Response,
// ) => {
//   try {
//     await deleteCancellationPolicy(req.params.id);

//     return successResponse(res, 'CancellationPolicy deleted successfully');
//   } catch (err) {
//     return errorResponse(res, (err as Error).message);
//   }
// };
