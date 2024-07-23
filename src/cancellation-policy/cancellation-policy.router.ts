import { Router } from 'express';
import { canAccess } from '../middlewares/can-access.middleware';
import { validateZodSchema } from '../middlewares/validate-zod-schema.middleware';
import {
  handleCreateCancellationPolicy,
  handleDeleteCancellationPolicy,
  handleGetCancellationPolicies,
  handleSeedCancellationPolicies,
  handleUpdateCancellationPolicy,
} from './cancellation-policy.controller';
import {
  cancellationPolicyCreateOrUpdateSchema,
  cancellationPolicyIdSchema,
} from './cancellation-policy.schema';

export const CANCELLATION_POLICY_ROUTER_ROOT = '/cancellation-policy';

const cancellationPolicyRouter = Router();

cancellationPolicyRouter.get('/', handleGetCancellationPolicies);

cancellationPolicyRouter.get('/seed', handleSeedCancellationPolicies);

cancellationPolicyRouter.post(
  '/',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({ body: cancellationPolicyCreateOrUpdateSchema }),
  handleCreateCancellationPolicy,
);

cancellationPolicyRouter.patch(
  '/:id',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({
    body: cancellationPolicyCreateOrUpdateSchema,
    params: cancellationPolicyIdSchema,
  }),
  handleUpdateCancellationPolicy,
);

cancellationPolicyRouter.delete(
  '/:id',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({
    params: cancellationPolicyIdSchema,
  }),
  handleDeleteCancellationPolicy,
);

export default cancellationPolicyRouter;
