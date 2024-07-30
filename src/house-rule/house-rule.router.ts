import { Router } from 'express';
import {
  handleGetHouseRules,
  handleSeedHouseRules,
} from './house-rule.controller';

export const HOUSE_RULE_ROUTER_ROOT = '/house-rule';

const houseRuleRouter = Router();

houseRuleRouter.get('/', handleGetHouseRules);

houseRuleRouter.get(
  '/seed',
  // canAccess('roles', ['SUPER_ADMIN']),
  handleSeedHouseRules,
);

// houseRuleRouter.post(
//   '/',
//   canAccess('roles', ['SUPER_ADMIN']),
//   validateZodSchema({ body: houseRuleCreateOrUpdateSchema }),
//   handleCreateHouseRule,
// );

// houseRuleRouter.patch(
//   '/:id',
//   canAccess('roles', ['SUPER_ADMIN']),
//   validateZodSchema({
//     body: houseRuleCreateOrUpdateSchema,
//     params: houseRuleIdSchema,
//   }),
//   handleUpdateHouseRule,
// );

// houseRuleRouter.delete(
//   '/:id',
//   canAccess('roles', ['SUPER_ADMIN']),
//   validateZodSchema({
//     params: houseRuleIdSchema,
//   }),
//   handleDeleteHouseRule,
// );

export default houseRuleRouter;
