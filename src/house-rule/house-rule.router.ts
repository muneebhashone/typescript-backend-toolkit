import { Router } from 'express';
import {
  handleCreateHouseRule,
  handleDeleteHouseRule,
  handleGetHouseRules,
  handleSeedHouseRules,
  handleUpdateHouseRule,
} from './house-rule.controller';
import { canAccess } from '../middlewares/can-access.middleware';
import { validateZodSchema } from '../middlewares/validate-zod-schema.middleware';
import {
  houseRuleCreateOrUpdateSchema,
  houseRuleIdSchema,
} from './house-rule.schema';

export const HOUSE_RULE_ROUTER_ROOT = '/house-rule';

const houseRuleRouter = Router();

houseRuleRouter.get('/', handleGetHouseRules);

houseRuleRouter.get(
  '/seed',
  // canAccess('roles', ['SUPER_ADMIN']),
  handleSeedHouseRules,
);

houseRuleRouter.post(
  '/',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({ body: houseRuleCreateOrUpdateSchema }),
  handleCreateHouseRule,
);

houseRuleRouter.patch(
  '/:id',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({
    body: houseRuleCreateOrUpdateSchema,
    params: houseRuleIdSchema,
  }),
  handleUpdateHouseRule,
);

houseRuleRouter.delete(
  '/:id',
  canAccess('roles', ['SUPER_ADMIN']),
  validateZodSchema({
    params: houseRuleIdSchema,
  }),
  handleDeleteHouseRule,
);

export default houseRuleRouter;
