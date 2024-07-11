import { Router } from 'express';
import {
  handleGetCitiesByCountryId,
  handleGetCitiesByStateId,
  handleGetCountries,
  handleGetStatesByCountryId,
} from './setup.controller';
import { validateZodSchema } from '../middlewares/validate-zod-schema.middleware';
import { countryIdSchema, stateIdSchema } from './setup.schema';

export const SETUP_ROUTER_ROOT = '/setup';

const setupRouter = Router();

setupRouter.get('/countries', handleGetCountries);

setupRouter.get(
  '/cities/:stateId/by-state',
  validateZodSchema({ params: stateIdSchema }),
  handleGetCitiesByStateId,
);

setupRouter.get(
  '/cities/:countryId/by-country',
  validateZodSchema({ params: countryIdSchema }),
  handleGetCitiesByCountryId,
);

setupRouter.get(
  '/states/:countryId',
  validateZodSchema({ params: countryIdSchema }),
  handleGetStatesByCountryId,
);

export default setupRouter;
