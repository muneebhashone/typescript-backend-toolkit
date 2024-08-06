import { UserIdSchemaType } from '../user/user.schema';
import { JwtPayload } from '../utils/auth.utils';
import { ChauffeurAvailability, IChauffeur } from './chauffeur-types';
import Chauffeur from './chauffeur.model';
import { ChauffeurBookingSchemaType } from './chauffeur.schema';

export const createChauffeur = async (
  body: ChauffeurBookingSchemaType,
  user: JwtPayload,
): Promise<ChauffeurBookingSchemaType> => {
  const { phoneNo } = body;
  const existingChauffeur = await Chauffeur.find({ phoneNo });
  if (existingChauffeur.length > 0) {
    throw new Error('Chauffeur Already Exists With This Phone Number');
  }
  const chauffeur = await Chauffeur.create({
    ...body,
    vendorId: user.sub,
    isVerified: false,
  });

  return chauffeur;
};

export const getMyChauffeurs = async (
  user: JwtPayload,
): Promise<IChauffeur[]> => {
  const allChauffeurs = await Chauffeur.find({ vendorId: user?.sub });

  return allChauffeurs;
};
export const verifyChauffeur = async (
  user: JwtPayload,
  chauffeurId: UserIdSchemaType['id'],
): Promise<IChauffeur> => {
  const chauffeur = await Chauffeur.findOneAndUpdate(
    { _id: chauffeurId, vendorId: user.sub },
    { isVerified: true },
    { new: true },
  );

  if (!chauffeur) {
    throw new Error('Chauffeur not found or unauthorized');
  }

  return chauffeur;
};

export const getChauffeursByVendorID = async (
  vendorId: UserIdSchemaType,
): Promise<IChauffeur[]> => {
  const chauffeurs = await Chauffeur.find({
    vendorId: vendorId.id,
    isVerified: true,
    availabilityStatus: ChauffeurAvailability.Available,
  });

  return chauffeurs;
};

export const updateChauffeurById = async (
  chauffeurId: UserIdSchemaType,
  updateData: ChauffeurBookingSchemaType,
): Promise<ChauffeurBookingSchemaType | null> => {
  const updatedChauffeur = await Chauffeur.findByIdAndUpdate(
    chauffeurId.id,
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedChauffeur) {
    throw new Error('Error updating chauffeur: Chauffeur not found');
  }

  return updatedChauffeur;
};

export const deleteChauffeurById = async (
  chauffeurId: UserIdSchemaType,
  userID: UserIdSchemaType,
): Promise<void> => {
  const result = await Chauffeur.deleteOne({
    _id: chauffeurId.id,
    vendorId: userID.id,
  });

  if (result.deletedCount === 0) {
    throw new Error('Error deleting chauffeur: Chauffeur not found');
  }
};

export const deleteAllChauffeurs = async (): Promise<void> => {
  const result = await Chauffeur.deleteMany({});

  if (result.deletedCount === 0) {
    throw new Error('Error deleting all chauffeurs: No chauffeurs found');
  }
};
