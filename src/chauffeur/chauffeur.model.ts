import mongoose, { Schema } from 'mongoose';
import { ChauffeurAvailability, IChauffeur } from './chauffeur-types';
import { ChauffeurBookingSchemaType } from './chauffeur.schema';

const ChauffeurSchema = new Schema<IChauffeur>(
  {
    firstName: {
      type: String,
      required: true,
      maxlength: 255,
    },
    lastName: {
      type: String,
      required: true,
      maxlength: 255,
    },
    chauffeurName: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 15,
    },
    photo: {
      type: String,
      required: true,
    },
    idFront: {
      type: String,
      required: true,
    },
    idBack: {
      type: String,
      required: true,
    },
    verificationPhoto: {
      type: String,
      required: true,
    },
    availabilityStatus: {
      type: String,
      enum: Object.values(ChauffeurAvailability),
      required: true,
    },
    isVerified: {
      type: Boolean,
    },
    vendorId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);
const Chauffeur = mongoose.model<IChauffeur>('Chauffeur', ChauffeurSchema);
export default Chauffeur;
