import { Router } from 'express';
import { validateZodSchema } from '../middlewares/validate-zod-schema.middleware';
import {
  handleCreateCompanyAndUser,
  handleGetCompanies,
} from './company.controller';
import {
  createCompanyAndUserSchema,
  getCompaniesSchema,
} from './company.schema';
import { canAccess } from '../middlewares/can-access.middleware';

export const COMPANY_ROUTER_ROOT = '/companies';

const companyRouter = Router();

companyRouter.get(
  '/',
  validateZodSchema({ query: getCompaniesSchema }),
  handleGetCompanies,
);

companyRouter.post(
  '/',
  canAccess('roles', [
    'WHITE_LABEL_ADMIN',
    'SUPER_ADMIN',
    'SUB_ADMIN',
    'CLIENT_SUPER_USER',
  ]),
  validateZodSchema({ body: createCompanyAndUserSchema }),
  handleCreateCompanyAndUser,
);

export default companyRouter;
