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
  const allChauffers = await Chauffeur.find({ vendorId: user?.sub });

  return allChauffers;
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
  try {
    return await Chauffeur.findByIdAndUpdate(chauffeurId, updateData, {
      new: true,
      runValidators: true,
    });
  } catch (err) {
    throw new Error('Error updating chauffeur');
  }
};

export const deleteChauffeurById = async (
  chauffeurId: UserIdSchemaType,
): Promise<void> => {
  try {
    await Chauffeur.findByIdAndDelete(chauffeurId);
  } catch (err) {
    throw new Error('Error deleting chauffeur');
  }
};

export const deleteAllChauffeurs = async (): Promise<void> => {
  try {
    await Chauffeur.deleteMany({});
  } catch (err) {
    throw new Error('Error deleting all chauffeurs');
  }
};
