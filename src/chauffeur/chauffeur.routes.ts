import { Router } from 'express';
import { canAccess } from '../middlewares/can-access.middleware';
import {
  handleCreateChauffeur,
  handleDeleteAllChauffeurs,
  handleDeleteChauffeurByID,
  handleGetChauffeursByVendorID,
  handleGetMyChauffeurs,
  handleSeedChauffeurs,
  handleUpdateChauffeurByID,
  handleVerifyChauffeur,
} from './chauffeur.controller';

export const CHAUFFEUR_ROUTER_ROOT = '/chauffeur';
const chauffeurRouter = Router();

chauffeurRouter.post(
  '/',
  canAccess('roles', ['VENDOR']),
  handleCreateChauffeur,
);
chauffeurRouter.post('/seed', handleSeedChauffeurs);
chauffeurRouter.get('/', canAccess('roles', ['VENDOR']), handleGetMyChauffeurs);
chauffeurRouter.patch(
  '/verify/:id',
  canAccess('roles', ['VENDOR']),
  handleVerifyChauffeur,
);
chauffeurRouter.get(
  '/:id',
  canAccess('roles', ['DEFAULT_USER']),
  handleGetChauffeursByVendorID,
);
chauffeurRouter.patch(
  '/update/:id',
  canAccess('roles', ['VENDOR']),
  handleUpdateChauffeurByID,
);
chauffeurRouter.delete(
  '/:id',
  canAccess('roles', ['VENDOR']),
  handleDeleteChauffeurByID,
);
chauffeurRouter.delete(
  '/',
  canAccess('roles', ['SUPER_ADMIN']),
  handleDeleteAllChauffeurs,
);
export default chauffeurRouter;
