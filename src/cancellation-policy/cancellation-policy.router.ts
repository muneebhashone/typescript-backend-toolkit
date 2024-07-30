import { Router } from 'express';
import {
  handleGetCancellationPolicies,
  handleSeedCancellationPolicies,
} from './cancellation-policy.controller';

export const CANCELLATION_POLICY_ROUTER_ROOT = '/cancellation-policy';

const cancellationPolicyRouter = Router();

cancellationPolicyRouter.get('/', handleGetCancellationPolicies);

cancellationPolicyRouter.get(
  '/seed',
  // canAccess('roles', ['SUPER_ADMIN']),
  handleSeedCancellationPolicies,
);

// cancellationPolicyRouter.post(
//   '/',
//   canAccess('roles', ['SUPER_ADMIN']),
//   validateZodSchema({ body: cancellationPolicyCreateOrUpdateSchema }),
//   handleCreateCancellationPolicy,
// );

// cancellationPolicyRouter.patch(
//   '/:id',
//   canAccess('roles', ['SUPER_ADMIN']),
//   validateZodSchema({
//     body: cancellationPolicyCreateOrUpdateSchema,
//     params: cancellationPolicyIdSchema,
//   }),
//   handleUpdateCancellationPolicy,
// );

// cancellationPolicyRouter.delete(
//   '/:id',
//   canAccess('roles', ['SUPER_ADMIN']),
//   validateZodSchema({
//     params: cancellationPolicyIdSchema,
//   }),
//   handleDeleteCancellationPolicy,
// );

export default cancellationPolicyRouter;
