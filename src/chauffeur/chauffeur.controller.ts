import { Request, Response } from 'express';
import { UserIdSchemaType } from '../user/user.schema';
import { errorResponse, successResponse } from '../utils/api.utils';
import { JwtPayload } from '../utils/auth.utils';
import { ChauffeurBookingSchemaType } from './chauffeur.schema';
import seedChauffeurs from './chauffeur.seeder';
import {
  createChauffeur,
  deleteAllChauffeurs,
  deleteChauffeurById,
  getChauffeursByVendorID,
  getMyChauffeurs,
  updateChauffeurById,
} from './chauffeur.services';
export const handleCreateChauffeur = async (
  req: Request<never, never, ChauffeurBookingSchemaType>,
  res: Response,
) => {
  try {
    if (!req.user || !req.user.sub) {
      return errorResponse(res, 'Unauthorized: User is not logged in');
    }

    const newChauffeur = await createChauffeur(
      req.body,
      req.user as JwtPayload,
    );

    return successResponse(res, 'Chauffeur created successfully', newChauffeur);
  } catch (err) {
    return errorResponse(
      res,
      (err as Error).message ||
        'An error occurred while creating the chauffeur',
    );
  }
};
export const handleGetMyChauffeurs = async (
  req: Request<never, never, ChauffeurBookingSchemaType>,
  res: Response,
) => {
  try {
    if (!req.user || !req.user.sub) {
      return errorResponse(res, 'Unauthorized: User is not logged in');
    }

    const newChauffeur = await getMyChauffeurs(req.user as JwtPayload);

    return successResponse(res, undefined, newChauffeur);
  } catch (err) {
    return errorResponse(
      res,
      (err as Error).message ||
        'An error occurred while creating the chauffeur',
    );
  }
};
export const handleGetChauffeursByVendorID = async (
  req: Request<UserIdSchemaType, never, never>,
  res: Response,
) => {
  try {
    const vendorId = req.params.id;

    if (!req.user || !req.user.sub) {
      return errorResponse(res, 'Unauthorized: User is not logged in');
    }

    const chauffeurs = await getChauffeursByVendorID({ id: vendorId });

    return successResponse(
      res,
      'Chauffeurs retrieved successfully',
      chauffeurs,
    );
  } catch (err) {
    return errorResponse(
      res,
      (err as Error).message || 'An error occurred while retrieving chauffeurs',
    );
  }
};
export const handleUpdateChauffeurByID = async (
  req: Request<UserIdSchemaType, never, ChauffeurBookingSchemaType>,
  res: Response,
) => {
  try {
    const chauffeurId = req.params.id;
    const updateData = req.body;

    const updatedChauffeur = await updateChauffeurById(
      { id: chauffeurId },
      updateData,
    );

    if (!updatedChauffeur) {
      return errorResponse(res, 'Chauffeur not found');
    }

    return successResponse(
      res,
      'Chauffeur updated successfully',
      updatedChauffeur,
    );
  } catch (err) {
    return errorResponse(
      res,
      (err as Error).message ||
        'An error occurred while updating the chauffeur',
    );
  }
};

export const handleDeleteChauffeurByID = async (
  req: Request<UserIdSchemaType, never, never>,
  res: Response,
) => {
  try {
    const chauffeurId = req.params.id;

    await deleteChauffeurById({ id: chauffeurId });

    return successResponse(res, 'Chauffeur deleted successfully');
  } catch (err) {
    return errorResponse(
      res,
      (err as Error).message ||
        'An error occurred while deleting the chauffeur',
    );
  }
};

export const handleDeleteAllChauffeurs = async (
  _: Request<never, never, never>,
  res: Response,
) => {
  try {
    await deleteAllChauffeurs();

    return successResponse(res, 'All chauffeurs deleted successfully');
  } catch (err) {
    return errorResponse(
      res,
      (err as Error).message ||
        'An error occurred while deleting all chauffeurs',
    );
  }
};
export const handleSeedChauffeurs = async (_: Request, res: Response) => {
  try {
    await seedChauffeurs();
    return successResponse(res, 'Chauffeurs seeded successfully');
  } catch (err) {
    return errorResponse(
      res,
      (err as Error).message || 'An error occurred while seeding chauffeurs',
    );
  }
};
