export const ChauffeurAvailability = {
  Available: 'available',
  InTransit: 'inTransit',
};
export interface IChauffeur {
  firstName: string;
  lastName: string;
  chauffeurName: string;
  phoneNo: string;
  photo: string;
  idFront: string;
  idBack: string;
  verificationPhoto: string;
  availabilityStatus: keyof typeof ChauffeurAvailability;
  isVerified: boolean;
  vendorId: string;
}
