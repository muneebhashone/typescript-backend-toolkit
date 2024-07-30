import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../utils/api.utils';
import { getHouseRule, seedHouseRules } from './house-rule.service';

export const handleSeedHouseRules = async (_: Request, res: Response) => {
  try {
    const result = await seedHouseRules();

    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

export const handleGetHouseRules = async (_: Request, res: Response) => {
  try {
    const result = await getHouseRule();

    return successResponse(res, undefined, result);
  } catch (err) {
    return errorResponse(res, (err as Error).message);
  }
};

// export const handleCreateHouseRule = async (
//   req: Request<never, never, HouseRuleCreateOrUpdateSchemaType>,
//   res: Response,
// ) => {
//   try {
//     const newHouseRule = await createHouseRule(req.body);

//     return successResponse(res, 'HouseRule created successfully', newHouseRule);
//   } catch (err) {
//     return errorResponse(res, (err as Error).message);
//   }
// };

// export const handleUpdateHouseRule = async (
//   req: Request<HouseRuleIdSchemaType, never, HouseRuleCreateOrUpdateSchemaType>,
//   res: Response,
// ) => {
//   try {
//     const udpatedHouseRule = await updateHouseRule(req.body, {
//       id: req.params.id,
//     });

//     return successResponse(
//       res,
//       'HouseRule updated successfully',
//       udpatedHouseRule,
//     );
//   } catch (err) {
//     return errorResponse(res, (err as Error).message);
//   }
// };

// export const handleDeleteHouseRule = async (
//   req: Request<HouseRuleIdSchemaType, never, never>,
//   res: Response,
// ) => {
//   try {
//     await deleteHouseRule(req.params.id);

//     return successResponse(res, 'HouseRule deleted successfully');
//   } catch (err) {
//     return errorResponse(res, (err as Error).message);
//   }
// };
